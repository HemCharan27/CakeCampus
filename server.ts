import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  connectDatabase, 
  getCakes, 
  getCakeById, 
  createCakeInDb,
  updateCakeInDb,
  deleteCakeInDb,
  saveOrder, 
  findOrderByOrderId, 
  findOrdersForTracking, 
  getAllOrders, 
  updateOrderStatusInDb,
  findAdminByEmail,
  getAdminById,
  findUserByEmail,
  findUserById,
  createOrUpdateGoogleUser,
  createCustomerUser,
  updateUserPassword,
  updateUserProfile,
  getOrdersForCustomer,
  getSettingValue,
  setSettingValue,
  findOrderByUtr,
  getColleges,
  createCollegeInDb,
  deleteCollegeInDb
} from './src/server/models';
import { checkPickupCutoff, validateAndCalculateOrder } from './src/server/pricingAndCutoff';
import { createNotionOrderRow, updateNotionOrderStatus } from './src/server/notionService';
import { sendPaymentConfirmationEmails, sendOrderCreatedEmail } from './src/server/emailService';
import { OrderDocument, OrderStatus, AdminDocument, CustomerUserDocument } from './src/server/types';

const app = express();
const port = Number(process.env.API_PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'cakecampus_secret_key_2026_campus_auth';

// Extend Express Request types for admin and customer auth
declare global {
  namespace Express {
    interface Request {
      admin?: AdminDocument;
      customer?: CustomerUserDocument;
    }
  }
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Password']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cookieParser());

const paymentProofDir = path.resolve(process.env.UPLOAD_DIR || './uploads/payment-proofs');
fs.mkdirSync(paymentProofDir, { recursive: true });
app.use('/uploads', express.static(path.dirname(paymentProofDir)));

// UPI configuration from environment
const CAMPUS_UPI_ID = process.env.CAMPUS_UPI_ID || 'cakecampus@okhdfcbank';
const CAMPUS_UPI_PAYEE_NAME = process.env.CAMPUS_UPI_PAYEE_NAME || 'CakeCampus';

// ponytail: simple in-memory rate limiter — replace with redis if multi-process
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (windowMs: number, max: number) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const key = `${req.path}:${req.ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (entry.count >= max) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  entry.count++;
  next();
};

// Generate unique human-friendly Order ID e.g. "CC-000123"
const generateOrderId = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CC-${num}`;
};

// Authentication Middleware for Admin
const requireAdminAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.cookies?.admin_token;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Backward compatibility with admin password header
  const legacyPassword = req.headers['x-admin-password'];
  if (!token && legacyPassword && legacyPassword === (process.env.ADMIN_PASSWORD || 'admin123')) {
    req.admin = {
      id: 'legacy-admin',
      name: 'Campus Administrator',
      email: 'admin@cakecampus.edu',
      passwordHash: '',
      role: 'superadmin'
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const admin = await getAdminById(decoded.adminId || decoded.id) || await findAdminByEmail(decoded.email);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized: Admin account no longer exists.' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session token.' });
  }
};

// Authentication Middleware for Customer
const requireCustomerAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.cookies?.customer_token;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Customer authentication required.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId || decoded.id) || await findUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ error: 'Customer account not found.' });
    }
    req.customer = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired customer session token.' });
  }
};

// --- ROUTES ---

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CakeCampus API',
    paymentMethod: 'UPI_QR'
  });
});

// Config/Public info
app.get('/api/config', async (_req, res) => {
  const deliveryCharge = await getSettingValue('DELIVERY_CHARGE', 50);
  res.json({
    paymentMethod: 'UPI_QR',
    campusUpiId: CAMPUS_UPI_ID,
    campusUpiPayeeName: CAMPUS_UPI_PAYEE_NAME,
    pickupPoint: 'CakeCampus Point',
    cutoffHourIST: 18,
    deliveryCharge,
    maxLineItems: 3
  });
});

// --- CUSTOMER AUTHENTICATION ROUTES ---

// Google Sign-In & Password Setup
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, googleId, avatarUrl, password, phone, rollNumber } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and Name are required for Google authentication.' });
    }

    const user = await createOrUpdateGoogleUser({
      email,
      name,
      googleId,
      avatarUrl,
      password,
      phone,
      rollNumber
    });

    const token = jwt.sign(
      { userId: user.id || user._id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        rollNumber: user.rollNumber || '',
        college: user.college || '',
        avatarUrl: user.avatarUrl || '',
        hasPassword: !!user.passwordHash && user.passwordHash.length > 0
      }
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

// Customer Register with Email & Password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, rollNumber, college } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const user = await createCustomerUser({
      name,
      email,
      password,
      phone,
      rollNumber,
      college
    });

    const token = jwt.sign(
      { userId: user.id || user._id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        rollNumber: user.rollNumber || '',
        college: user.college || '',
        avatarUrl: user.avatarUrl || '',
        hasPassword: true
      }
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create customer account.' });
  }
});

// Customer Login with Email & Password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please register.' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account was signed up via Google without a password. Please sign in with Google or set a password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user.id || user._id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        rollNumber: user.rollNumber || '',
        college: user.college || '',
        avatarUrl: user.avatarUrl || '',
        hasPassword: true
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Customer Get Profile
app.get('/api/auth/me', requireCustomerAuth, (req, res) => {
  const user = req.customer!;
  res.json({
    success: true,
    user: {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      rollNumber: user.rollNumber || '',
      college: user.college || '',
      avatarUrl: user.avatarUrl || '',
      hasPassword: !!user.passwordHash && user.passwordHash.length > 0
    }
  });
});

// Customer Update Selected College
app.patch('/api/auth/select-college', requireCustomerAuth, async (req, res) => {
  try {
    const user = req.customer!;
    const { college } = req.body;
    if (!college || typeof college !== 'string' || !college.trim()) {
      return res.status(400).json({ error: 'College name is required.' });
    }

    const updated = await updateUserProfile(user.id || user._id!, { college: college.trim() });
    if (!updated) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      success: true,
      message: 'College updated successfully.',
      user: {
        id: updated.id || updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        rollNumber: updated.rollNumber || '',
        college: updated.college || '',
        avatarUrl: updated.avatarUrl || '',
        hasPassword: !!updated.passwordHash && updated.passwordHash.length > 0
      }
    });
  } catch (err: any) {
    console.error('Select college error:', err);
    res.status(500).json({ error: 'Failed to update college.' });
  }
});

// Customer Update Profile / Set Password
app.patch('/api/auth/profile', requireCustomerAuth, async (req, res) => {
  try {
    const user = req.customer!;
    const { name, phone, rollNumber, college, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (rollNumber !== undefined) updates.rollNumber = rollNumber.trim().toUpperCase();
    if (college !== undefined) updates.college = college.trim();
    if (password && password.trim().length >= 4) {
      updates.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await updateUserProfile(user.id || user._id!, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: updated.id || updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        rollNumber: updated.rollNumber || '',
        college: updated.college || '',
        avatarUrl: updated.avatarUrl || '',
        hasPassword: !!updated.passwordHash && updated.passwordHash.length > 0
      }
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Customer Logout
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('customer_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Customer Orders List
app.get('/api/customer/orders', requireCustomerAuth, async (req, res) => {
  try {
    const user = req.customer!;
    const orders = await getOrdersForCustomer(user.email, user.phone);
    res.json({ success: true, orders });
  } catch (err: any) {
    console.error('Customer orders error:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// --- ADMIN AUTH ROUTES ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    const token = jwt.sign(
      { adminId: admin.id || admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id || admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during admin login.' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin Profile Check
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  const admin = req.admin!;
  res.json({
    success: true,
    admin: {
      id: admin.id || admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

// --- COLLEGE / CAMPUS ROUTES ---

// 1. GET /api/colleges - List all active colleges
app.get('/api/colleges', async (_req, res) => {
  try {
    const colleges = await getColleges();
    res.json({ success: true, colleges });
  } catch (err: any) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ error: 'Failed to retrieve colleges.' });
  }
});

// Admin Add College
app.post('/api/admin/colleges', requireAdminAuth, async (req, res) => {
  try {
    const { name, code, location, pickupPoint } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'College name is required.' });
    }

    const created = await createCollegeInDb({
      name: name.trim(),
      code: (code || name).trim().toUpperCase(),
      location: (location || '').trim(),
      pickupPoint: (pickupPoint || 'CakeCampus Point').trim(),
      isActive: true
    });

    res.status(201).json({ success: true, college: created });
  } catch (err: any) {
    console.error('Admin create college error:', err);
    res.status(500).json({ error: err.message || 'Failed to add college.' });
  }
});

// Admin Delete College
app.delete('/api/admin/colleges/:id', requireAdminAuth, async (req, res) => {
  try {
    const success = await deleteCollegeInDb(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'College not found.' });
    }
    res.json({ success: true, message: 'College deleted successfully.' });
  } catch (err: any) {
    console.error('Admin delete college error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete college.' });
  }
});

// --- CAKE CATALOG ROUTES ---

// 1. GET /api/cakes - List available cakes
app.get('/api/cakes', async (_req, res) => {
  try {
    const cakes = await getCakes();
    res.json(cakes);
  } catch (err: any) {
    console.error('Error fetching cakes:', err);
    res.status(500).json({ error: 'Failed to retrieve cake catalog.' });
  }
});

// 2. GET /api/cakes/:id - Cake details
app.get('/api/cakes/:id', async (req, res) => {
  try {
    const cake = await getCakeById(req.params.id);
    if (!cake) {
      return res.status(404).json({ error: 'Cake not found.' });
    }
    res.json(cake);
  } catch (err: any) {
    console.error('Error fetching cake:', err);
    res.status(500).json({ error: 'Failed to retrieve cake.' });
  }
});

// Admin Create Cake
app.post('/api/admin/cakes', requireAdminAuth, async (req, res) => {
  try {
    const { name, description, images, weights, flavours, toppings, addOns, category, itemType } = req.body;
    if (!name || !weights?.length || !flavours?.length) {
      return res.status(400).json({ error: 'Name, weights array, and flavours array are required.' });
    }
    const created = await createCakeInDb({
      name,
      description,
      images: images?.length ? images : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'],
      weights,
      flavours,
      toppings: toppings || [],
      addOns: addOns || [],
      category: category || 'Classic',
      itemType: itemType || 'cake',
      isAvailable: true
    });
    res.status(201).json({ success: true, cake: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create cake.' });
  }
});

// Admin Update Cake
app.patch('/api/admin/cakes/:id', requireAdminAuth, async (req, res) => {
  try {
    const updated = await updateCakeInDb(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Cake not found.' });
    }
    res.json({ success: true, cake: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update cake.' });
  }
});

// Admin Delete Cake
app.delete('/api/admin/cakes/:id', requireAdminAuth, async (req, res) => {
  try {
    const success = await deleteCakeInDb(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Cake not found or could not be deleted.' });
    }
    res.json({ success: true, message: 'Cake deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete cake.' });
  }
});

// --- ORDER & PAYMENT ROUTES ---

// 3. POST /api/orders - Create Order (UPI QR Manual Payment)
app.post('/api/orders', rateLimit(60_000, 5), async (req, res) => {
  try {
    const { customer, cakeMessage, pickupDate, pickupPoint, college, items } = req.body;

    // Validate customer details
    if (!customer?.name || !customer?.phone || !customer?.email || !customer?.rollNumber) {
      return res.status(400).json({ 
        error: 'Customer name, 10-digit phone, valid email, and student roll number are all required.' 
      });
    }

    // REQUIREMENT A: Delivery/Pickup Date is strictly mandatory
    if (!pickupDate || typeof pickupDate !== 'string' || !pickupDate.trim()) {
      return res.status(400).json({
        error: 'Delivery/Pickup Date is mandatory before checkout.'
      });
    }

    // Business Rule: Validate Pre-Order Cutoff (Previous Day 6:00 PM IST)
    const cutoffCheck = checkPickupCutoff(pickupDate);
    if (!cutoffCheck.isValid) {
      return res.status(400).json({ 
        error: cutoffCheck.reason || 'Orders for this date close at 6:00 PM the previous day.' 
      });
    }

    // Business Rule: Recalculate and validate pricing & items server-side
    let calculatedOrder;
    try {
      calculatedOrder = await validateAndCalculateOrder(items);
    } catch (valErr: any) {
      return res.status(400).json({ error: valErr?.message || 'Invalid order items.' });
    }

    const activeUpiId = await getSettingValue('CAMPUS_UPI_ID', CAMPUS_UPI_ID);
    const activePayeeName = await getSettingValue('CAMPUS_UPI_PAYEE_NAME', CAMPUS_UPI_PAYEE_NAME);
    const customUpiQrUrl = await getSettingValue('CUSTOM_UPI_QR_URL', '');

    const orderId = generateOrderId();
    const upiNote = `CakeCampus ${orderId}`;
    const upiQrString = customUpiQrUrl || `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(activePayeeName)}&am=${calculatedOrder.totalAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
    const selectedCollege = (college || customer.college || '').trim();

    // Build MongoDB Order Document
    const orderDoc: OrderDocument = {
      orderId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim().toLowerCase(),
        rollNumber: customer.rollNumber.trim().toUpperCase(),
        college: selectedCollege
      },
      college: selectedCollege,
      cakeMessage: (cakeMessage || '').trim(),
      pickupDate: new Date(`${pickupDate.trim()}T00:00:00.000Z`),
      pickupPoint: (pickupPoint || 'CakeCampus Point').trim(),
      items: calculatedOrder.items,
      itemsTotal: calculatedOrder.itemsTotal,
      deliveryCharge: calculatedOrder.deliveryCharge,
      totalAmount: calculatedOrder.totalAmount,
      status: 'PAYMENT_PENDING',
      payment: {
        method: 'UPI_QR',
        upiId: activeUpiId,
        payeeName: activePayeeName,
        upiNote,
        verificationStatus: 'PENDING'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save in MongoDB (Source of truth)
    const savedOrder = await saveOrder(orderDoc);

    // Mirror to Notion Database in background
    createNotionOrderRow(savedOrder).then(notionRes => {
      if (notionRes.pageId) {
        updateOrderStatusInDb(savedOrder.orderId, 'PAYMENT_PENDING', undefined, {
          pageId: notionRes.pageId,
          pageUrl: notionRes.pageUrl
        }).catch(err => console.error('Error saving Notion pageId to order:', err));
      }
    }).catch(err => console.error('Notion async mirror error:', err));

    // Send "order created — please pay" email
    sendOrderCreatedEmail(savedOrder).catch(err =>
      console.error('Order created email error:', err)
    );

    res.status(201).json({
      success: true,
      orderId: savedOrder.orderId,
      order: savedOrder,
      totalAmount: savedOrder.totalAmount,
      upiQrString,
      customUpiQrUrl: customUpiQrUrl || undefined,
      upiId: activeUpiId,
      payeeName: activePayeeName,
      upiNote,
      pickupDate: pickupDate.trim(),
      pickupPoint: savedOrder.pickupPoint
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err?.message || 'Server error while creating order.' });
  }
});

// 4. GET /api/orders/:orderId/payment - Get payment instructions for an order
app.get('/api/orders/:orderId/payment', async (req, res) => {
  try {
    const order = await findOrderByOrderId(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const activeUpiId = await getSettingValue('CAMPUS_UPI_ID', order.payment.upiId || CAMPUS_UPI_ID);
    const activePayeeName = await getSettingValue('CAMPUS_UPI_PAYEE_NAME', order.payment.payeeName || CAMPUS_UPI_PAYEE_NAME);
    const customUpiQrUrl = await getSettingValue('CUSTOM_UPI_QR_URL', '');
    const upiQrString = customUpiQrUrl || `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(activePayeeName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent(order.payment.upiNote)}`;

    res.json({
      success: true,
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      upiId: activeUpiId,
      payeeName: activePayeeName,
      upiNote: order.payment.upiNote,
      upiQrString,
      customUpiQrUrl: customUpiQrUrl || undefined,
      verificationStatus: order.payment.verificationStatus,
      status: order.status
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get payment details.' });
  }
});

// Upload payment proof outside MongoDB. The client sends a validated, resized image data URL.
app.post('/api/uploads/payment-proof', rateLimit(60_000, 10), async (req, res) => {
  try {
    const imageData = String(req.body?.imageData || '');
    const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: 'Screenshot must be a JPEG, PNG, or WebP image.' });
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Screenshot too large (max 5MB).' });
    }
    const extension = match[1].split('/')[1].replace('jpeg', 'jpg');
    const filename = `${crypto.randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(paymentProofDir, filename), buffer, { flag: 'wx' });
    const baseUrl = process.env.APP_URL || `http://localhost:${port}`;
    res.status(201).json({ success: true, screenshotUrl: `${baseUrl}/uploads/payment-proofs/${filename}` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to store screenshot.' });
  }
});

// 5. POST /api/orders/:orderId/payment-proof - Submit UTR + screenshot URL
app.post('/api/orders/:orderId/payment-proof', rateLimit(60_000, 10), async (req, res) => {
  try {
    const { utr, screenshotUrl } = req.body;
    const { orderId } = req.params;

    if (!utr || String(utr).trim().length < 8) {
      return res.status(400).json({ error: 'UTR / Transaction ID is required (minimum 8 characters).' });
    }

    const order = await findOrderByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'PAYMENT_PENDING') {
      return res.status(400).json({ error: `Payment proof already submitted for this order (status: ${order.status}).` });
    }

    // Duplicate UTR check
    const existingWithUtr = await findOrderByUtr(utr.trim());
    if (existingWithUtr && existingWithUtr.orderId !== orderId) {
      return res.status(400).json({ error: 'This UTR has already been used for another order. Please check your transaction details.' });
    }

    if (screenshotUrl !== undefined && (typeof screenshotUrl !== 'string' || !screenshotUrl.startsWith('http'))) {
      return res.status(400).json({ error: 'Invalid screenshot URL.' });
    }

    const updated = await updateOrderStatusInDb(orderId, 'PAYMENT_SUBMITTED', {
      utr: utr.trim(),
      screenshotUrl: screenshotUrl || undefined,
      submittedAt: new Date().toISOString(),
      verificationStatus: 'SUBMITTED'
    });

    // Update Notion
    if (updated?.notion?.pageId) {
      updateNotionOrderStatus(updated.notion.pageId, 'PAYMENT_SUBMITTED', { utr: utr.trim() })
        .catch(err => console.error('Notion UTR update error:', err));
    }

    res.json({
      success: true,
      message: 'Payment proof submitted. Awaiting admin verification.',
      order: updated || order
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit payment proof.' });
  }
});

// 6. PATCH /api/admin/orders/:orderId/verify-payment - Admin verify or reject payment
app.patch('/api/admin/orders/:orderId/verify-payment', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { decision, rejectionReason } = req.body;

    if (!decision || !['VERIFY', 'REJECT'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be "VERIFY" or "REJECT".' });
    }

    const order = await findOrderByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'PAYMENT_SUBMITTED') {
      return res.status(400).json({ error: `Cannot verify/reject order with status "${order.status}". Expected PAYMENT_SUBMITTED.` });
    }

    const adminId = req.admin?.id || req.admin?._id || 'admin';

    if (decision === 'VERIFY') {
      const updated = await updateOrderStatusInDb(orderId, 'PAID_VERIFIED', {
        verifiedAt: new Date().toISOString(),
        verifiedByAdminId: adminId,
        verificationStatus: 'VERIFIED'
      });

      if (updated?.notion?.pageId) {
        updateNotionOrderStatus(updated.notion.pageId, 'PAID_VERIFIED')
          .catch(err => console.error('Notion verify error:', err));
      }

      sendPaymentConfirmationEmails(updated || order).catch(err =>
        console.error('Email dispatch error on verify:', err)
      );

      return res.json({ success: true, message: 'Payment verified.', order: updated });
    } else {
      const updated = await updateOrderStatusInDb(orderId, 'PAYMENT_REJECTED', {
        rejectionReason: rejectionReason || 'Payment could not be verified.',
        verificationStatus: 'REJECTED'
      });

      if (updated?.notion?.pageId) {
        updateNotionOrderStatus(updated.notion.pageId, 'PAYMENT_REJECTED')
          .catch(err => console.error('Notion reject error:', err));
      }

      return res.json({ success: true, message: 'Payment rejected.', order: updated });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Payment verification failed.' });
  }
});

// Public config endpoint for client apps
app.get('/api/config', async (_req, res) => {
  const deliveryCharge = await getSettingValue('DELIVERY_CHARGE', 50);
  const customUpiQrUrl = await getSettingValue('CUSTOM_UPI_QR_URL', '');
  const campusUpiId = await getSettingValue('CAMPUS_UPI_ID', CAMPUS_UPI_ID);
  const campusUpiPayeeName = await getSettingValue('CAMPUS_UPI_PAYEE_NAME', CAMPUS_UPI_PAYEE_NAME);
  res.json({
    deliveryCharge,
    customUpiQrUrl,
    campusUpiId,
    campusUpiPayeeName,
  });
});

// Admin settings endpoints
app.get('/api/admin/settings', requireAdminAuth, async (_req, res) => {
  const deliveryCharge = await getSettingValue('DELIVERY_CHARGE', 50);
  const customUpiQrUrl = await getSettingValue('CUSTOM_UPI_QR_URL', '');
  const campusUpiId = await getSettingValue('CAMPUS_UPI_ID', CAMPUS_UPI_ID);
  const campusUpiPayeeName = await getSettingValue('CAMPUS_UPI_PAYEE_NAME', CAMPUS_UPI_PAYEE_NAME);
  res.json({
    success: true,
    settings: [
      { key: 'DELIVERY_CHARGE', value: deliveryCharge, currency: 'INR' },
      { key: 'CUSTOM_UPI_QR_URL', value: customUpiQrUrl },
      { key: 'CAMPUS_UPI_ID', value: campusUpiId },
      { key: 'CAMPUS_UPI_PAYEE_NAME', value: campusUpiPayeeName }
    ]
  });
});

app.patch('/api/admin/settings/delivery-charge', requireAdminAuth, async (req, res) => {
  const { value } = req.body;
  if (typeof value !== 'number' || value < 0) {
    return res.status(400).json({ error: 'Delivery charge must be a non-negative number.' });
  }
  await setSettingValue('DELIVERY_CHARGE', value, 'INR');
  res.json({ success: true, message: `Delivery charge updated to ₹${value}.` });
});

// Admin Payment & QR Management Routes
const qrUploadDir = path.resolve('./uploads/qr');
fs.mkdirSync(qrUploadDir, { recursive: true });

app.get('/api/admin/payments/config', requireAdminAuth, async (_req, res) => {
  try {
    const campusUpiId = await getSettingValue('CAMPUS_UPI_ID', CAMPUS_UPI_ID);
    const campusUpiPayeeName = await getSettingValue('CAMPUS_UPI_PAYEE_NAME', CAMPUS_UPI_PAYEE_NAME);
    const customUpiQrUrl = await getSettingValue('CUSTOM_UPI_QR_URL', '');
    const dynamicUpiIntent = `upi://pay?pa=${encodeURIComponent(campusUpiId)}&pn=${encodeURIComponent(campusUpiPayeeName)}&cu=INR`;
    const dynamicQrPreview = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(dynamicUpiIntent)}`;

    res.json({
      success: true,
      campusUpiId,
      campusUpiPayeeName,
      customUpiQrUrl,
      dynamicQrPreview,
      defaultUpiId: CAMPUS_UPI_ID,
      defaultPayeeName: CAMPUS_UPI_PAYEE_NAME,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load payment configuration.' });
  }
});

app.post('/api/admin/payments/config', requireAdminAuth, async (req, res) => {
  try {
    const { campusUpiId, campusUpiPayeeName, customUpiQrUrl } = req.body;
    if (campusUpiId !== undefined) {
      await setSettingValue('CAMPUS_UPI_ID', String(campusUpiId).trim());
    }
    if (campusUpiPayeeName !== undefined) {
      await setSettingValue('CAMPUS_UPI_PAYEE_NAME', String(campusUpiPayeeName).trim());
    }
    if (customUpiQrUrl !== undefined) {
      await setSettingValue('CUSTOM_UPI_QR_URL', String(customUpiQrUrl).trim());
    }
    res.json({ success: true, message: 'Payment settings saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update payment settings.' });
  }
});

app.post('/api/admin/payments/qr-upload', requireAdminAuth, async (req, res) => {
  try {
    const imageData = String(req.body?.imageData || '');
    const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: 'QR image must be a JPEG, PNG, or WebP image.' });
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'QR image too large (max 5MB).' });
    }
    const extension = match[1].split('/')[1].replace('jpeg', 'jpg');
    const filename = `upi-qr-${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(qrUploadDir, filename), buffer);
    const baseUrl = process.env.APP_URL || `http://localhost:${port}`;
    const qrUrl = `${baseUrl}/uploads/qr/${filename}`;
    
    await setSettingValue('CUSTOM_UPI_QR_URL', qrUrl);

    res.status(201).json({
      success: true,
      message: 'Custom UPI QR image uploaded and activated successfully.',
      qrUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save QR image.' });
  }
});

app.delete('/api/admin/payments/qr-custom', requireAdminAuth, async (_req, res) => {
  try {
    await setSettingValue('CUSTOM_UPI_QR_URL', '');
    res.json({ success: true, message: 'Reverted to dynamically generated UPI QR code.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset QR image.' });
  }
});

// Admin manual trigger to send customer confirmation email
app.post('/api/admin/orders/:orderId/send-confirmation-email', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await findOrderByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: `Order "${orderId}" not found.` });
    }

    const { customerSent, adminSent } = await sendPaymentConfirmationEmails(order, true);
    res.json({
      success: true,
      message: `Confirmation email sent successfully to ${order.customer.email}`,
      customerSent,
      adminSent
    });
  } catch (err: any) {
    console.error('Send confirmation email error:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch confirmation email.' });
  }
});

// 6. GET /api/orders/track - Order tracking (Order ID + Phone/Email)
app.get('/api/orders/track', async (req, res) => {
  try {
    const orderId = String(req.query.orderId || '').trim();
    const phoneOrEmail = String(req.query.phone || req.query.email || '').trim();

    if (!orderId || !phoneOrEmail) {
      return res.status(400).json({ error: 'Both Order ID and registered Phone (or Email) are required.' });
    }

    const order = await findOrdersForTracking(orderId, phoneOrEmail);
    if (!order) {
      return res.status(404).json({ 
        error: 'No matching order found. Please check your Order ID and phone number / email.' 
      });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customer.name,
        rollNumber: order.customer.rollNumber,
        pickupDate: order.pickupDate,
        pickupPoint: order.pickupPoint,
        cakeMessage: order.cakeMessage,
        status: order.status,
        items: order.items,
        itemsTotal: order.itemsTotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        payment: order.payment,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (err: any) {
    console.error('Order tracking error:', err);
    res.status(500).json({ error: 'Failed to retrieve order tracking info.' });
  }
});

// 7. GET /api/admin/orders - Admin list all orders (Protected by JWT Auth)
app.get('/api/admin/orders', requireAdminAuth, async (req, res) => {
  try {
    let orders = await getAllOrders();
    const { pickupDate, status } = req.query;

    if (pickupDate) {
      orders = orders.filter(o => {
        const dStr = typeof o.pickupDate === 'string' 
          ? o.pickupDate.split('T')[0] 
          : new Date(o.pickupDate).toISOString().split('T')[0];
        return dStr === String(pickupDate);
      });
    }

    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }

    res.json(orders);
  } catch (err: any) {
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch admin orders.' });
  }
});

// 8. PATCH /api/admin/orders/:orderId/status - Update order status (Protected by JWT Auth)
app.patch('/api/admin/orders/:orderId/status', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses: OrderStatus[] = [
      'PAYMENT_PENDING', 
      'PAYMENT_SUBMITTED', 
      'PAID_VERIFIED', 
      'PAYMENT_REJECTED', 
      'PREPARING', 
      'READY_FOR_PICKUP', 
      'COMPLETED', 
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}` 
      });
    }

    const order = await findOrderByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: `Order "${orderId}" not found.` });
    }

    const updated = await updateOrderStatusInDb(orderId, status);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update order status in database.' });
    }

    // Automatically send confirmation email when status is set to COMPLETED or PAID_VERIFIED
    if (status === 'COMPLETED' || status === 'PAID_VERIFIED') {
      sendPaymentConfirmationEmails(updated).then(mailRes => {
        console.log(`✉️ Automatic confirmation email sent for order ${orderId} (${status}): customer=${mailRes.customerSent}`);
      }).catch(mailErr => {
        console.error('Automatic email sending error:', mailErr);
      });
    }

    // Mirror status update to Notion database row
    if (updated.notion?.pageId) {
      updateNotionOrderStatus(updated.notion.pageId, status).catch(err =>
        console.error('Admin status update Notion error:', err)
      );
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated
    });
  } catch (err: any) {
    console.error('Admin update status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Serve frontend production build from dist/ directory if present
const distDir = path.resolve('./dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Initialize database & Start server
connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🎂 CakeCampus backend server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Database connection failed, starting server in local mode:', err);
  app.listen(port, () => {
    console.log(`🎂 CakeCampus backend server running on http://localhost:${port} (Local Mode)`);
  });
});
