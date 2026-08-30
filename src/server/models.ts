import mongoose, { Schema, Model } from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { CakeDocument, OrderDocument, OrderStatus, AdminDocument, CustomerUserDocument, CollegeDocument } from './types';
import { INITIAL_CAKES } from './seedData';

// --- Mongoose Schemas ---
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  rollNumber: { type: String },
  college: { type: String },
  passwordHash: { type: String },
  googleId: { type: String },
  avatarUrl: { type: String },
  role: { type: String, default: 'customer' }
}, { timestamps: true });

const CollegeSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  location: { type: String, default: '' },
  pickupPoint: { type: String, default: 'CakeCampus Point' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CakeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  category: { type: String, default: 'General' },
  itemType: { type: String, enum: ['cake', 'biscuit'], default: 'cake' },
  weights: [
    {
      key: { type: String, required: true },
      price: { type: Number, required: true },
    }
  ],
  flavours: [
    {
      key: { type: String, required: true },
      extra: { type: Number, default: 0 },
    }
  ],
  toppings: [
    {
      key: { type: String, required: true },
      extra: { type: Number, default: 0 },
    }
  ],
  addOns: [
    {
      key: { type: String, required: true },
      extra: { type: Number, default: 0 },
    }
  ]
}, { timestamps: true });

const AdminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  currency: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    rollNumber: { type: String, required: true },
    college: { type: String }
  },
  college: { type: String },
  cakeMessage: { type: String, default: '' },
  pickupDate: { type: Date, required: true },
  pickupPoint: { type: String, default: 'CakeCampus Point' },
  items: [
    {
      cakeId: { type: Schema.Types.Mixed, required: true },
      cakeNameSnapshot: { type: String, required: true },
      image: { type: String },
      weightKey: { type: String, required: true },
      weightPriceSnapshot: { type: Number, required: true },
      flavourKey: { type: String, required: true },
      flavourExtraSnapshot: { type: Number, default: 0 },
      toppingKeys: [{ type: String }],
      toppingsExtraSnapshot: { type: Number, default: 0 },
      addOnKeys: [{ type: String }],
      addOnsExtraSnapshot: { type: Number, default: 0 },
      unitPrice: { type: Number, required: true },
      qty: { type: Number, required: true, default: 1 },
      lineTotal: { type: Number, required: true }
    }
  ],
  itemsTotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 50 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAID_VERIFIED', 'PAYMENT_REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'],
    default: 'PAYMENT_PENDING'
  },
  payment: {
    method: { type: String, default: 'UPI_QR' },
    upiId: { type: String },
    payeeName: { type: String },
    upiNote: { type: String },
    utr: { type: String, sparse: true },
    screenshotUrl: { type: String },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedByAdminId: { type: String },
    rejectionReason: { type: String },
    verificationStatus: { type: String, enum: ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'], default: 'PENDING' }
  },
  notion: {
    pageId: { type: String },
    pageUrl: { type: String },
    syncedAt: { type: Date }
  },
  emailSentToCustomer: { type: Boolean, default: false },
  emailSentToAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel: Model<any> = mongoose.models.User || mongoose.model('User', UserSchema);
export const CakeModel: Model<any> = mongoose.models.Cake || mongoose.model('Cake', CakeSchema);
export const AdminModel: Model<any> = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const SettingsModel: Model<any> = mongoose.models.Setting || mongoose.model('Setting', SettingsSchema);
export const CollegeModel: Model<any> = mongoose.models.College || mongoose.model('College', CollegeSchema);
export const OrderModel: Model<any> = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// --- Local File Persistence ---
const dataDir = path.resolve(process.env.DATA_DIR || './data');
const cakesFile = path.join(dataDir, 'cakes.json');
const ordersFile = path.join(dataDir, 'orders.json');
const adminsFile = path.join(dataDir, 'admins.json');
const usersFile = path.join(dataDir, 'users.json');
const settingsFile = path.join(dataDir, 'settings.json');
const collegesFile = path.join(dataDir, 'colleges.json');

export const INITIAL_COLLEGES: Omit<CollegeDocument, '_id' | 'id'>[] = [
  {
    name: 'IIT Bombay',
    code: 'IITB',
    location: 'Powai, Mumbai',
    pickupPoint: 'SAC Ground Floor Counter',
    isActive: true
  },
  {
    name: 'BITS Pilani (Hyderabad Campus)',
    code: 'BITS-HYD',
    location: 'Jawahar Nagar, Hyderabad',
    pickupPoint: 'Student Activity Center (SAC)',
    isActive: true
  },
  {
    name: 'NIT Warangal',
    code: 'NITW',
    location: 'Kazipet, Warangal',
    pickupPoint: 'Student Food Court & SAC',
    isActive: true
  },
  {
    name: 'IIT Madras',
    code: 'IITM',
    location: 'Guindy, Chennai',
    pickupPoint: 'Himalaya Food Court Point',
    isActive: true
  },
  {
    name: 'VNR VJIET',
    code: 'VNRVJIET',
    location: 'Bachupally, Hyderabad',
    pickupPoint: 'CakeCampus Point (Canteen Gate)',
    isActive: true
  }
];

fs.mkdirSync(dataDir, { recursive: true });

let isMongoConnected = false;

// --- Settings Helpers (with simple in-process cache) ---
let settingsCache: Record<string, { value: any; ts: number }> = {};
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getSettingValue = async (key: string, defaultValue: any = null): Promise<any> => {
  const cached = settingsCache[key];
  if (cached && Date.now() - cached.ts < SETTINGS_CACHE_TTL) return cached.value;

  if (isMongoConnected) {
    try {
      const doc = await SettingsModel.findOne({ key }).lean();
      const val = doc ? doc.value : defaultValue;
      settingsCache[key] = { value: val, ts: Date.now() };
      return val;
    } catch { /* fall through */ }
  }
  try {
    if (fs.existsSync(settingsFile)) {
      const all = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      const found = all.find((s: any) => s.key === key);
      const val = found ? found.value : defaultValue;
      settingsCache[key] = { value: val, ts: Date.now() };
      return val;
    }
  } catch { /* fall through */ }
  return defaultValue;
};

export const setSettingValue = async (key: string, value: any, currency?: string): Promise<void> => {
  settingsCache[key] = { value, ts: Date.now() };
  if (isMongoConnected) {
    try {
      await SettingsModel.findOneAndUpdate(
        { key },
        { $set: { key, value, currency, updatedAt: new Date() } },
        { upsert: true }
      );
      return;
    } catch { /* fall through */ }
  }
  try {
    const all = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile, 'utf8')) : [];
    const idx = all.findIndex((s: any) => s.key === key);
    const entry = { key, value, currency, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = entry; else all.push(entry);
    fs.writeFileSync(settingsFile, JSON.stringify(all, null, 2));
  } catch (e) { console.error('Failed to save setting locally:', e); }
};

// Duplicate UTR check
export const findOrderByUtr = async (utr: string): Promise<OrderDocument | null> => {
  const cleanUtr = utr.trim();
  if (!cleanUtr) return null;
  if (isMongoConnected) {
    try {
      const found = await OrderModel.findOne({ 'payment.utr': cleanUtr }).lean();
      if (found) return { ...found, _id: String(found._id), id: String(found._id) } as OrderDocument;
    } catch { /* fall through */ }
  }
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    return orders.find(o => o.payment?.utr === cleanUtr) || null;
  } catch { return null; }
};

export const connectDatabase = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ No MONGODB_URI provided. Running with integrated resilient store.');
    await ensureLocalSeed();
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    await seedMongoCakesIfEmpty();
    await seedMongoCollegesIfEmpty();
    await seedDefaultAdmin();
    return true;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection error (${err?.message || err}). Falling back to local store.`);
    isMongoConnected = false;
    await ensureLocalSeed();
    return false;
  }
};

const ensureLocalSeed = async () => {
  if (!fs.existsSync(cakesFile)) {
    const seeded = INITIAL_CAKES.map((cake, idx) => ({
      _id: `cake-${idx + 1}`,
      id: cake.id || `cake-${idx + 1}`,
      ...cake,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    fs.writeFileSync(cakesFile, JSON.stringify(seeded, null, 2));
  }
  if (!fs.existsSync(collegesFile)) {
    const seeded = INITIAL_COLLEGES.map((college, idx) => ({
      _id: `college-${idx + 1}`,
      id: `college-${idx + 1}`,
      ...college,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    fs.writeFileSync(collegesFile, JSON.stringify(seeded, null, 2));
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(adminsFile)) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
    const hash = await bcrypt.hash(defaultPassword, 10);
    const defaultAdmin: AdminDocument = {
      id: 'admin-1',
      name: 'Campus Administrator',
      email: 'admin@cakecampus.edu',
      passwordHash: hash,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(adminsFile, JSON.stringify([defaultAdmin], null, 2));
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
};

const seedMongoCollegesIfEmpty = async () => {
  try {
    const count = await CollegeModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial campus colleges into MongoDB...');
      await CollegeModel.insertMany(INITIAL_COLLEGES);
      console.log('✅ Colleges seeded into MongoDB.');
    }
  } catch (e: any) {
    console.error('Failed to seed colleges in MongoDB:', e?.message || e);
  }
};

const seedMongoCakesIfEmpty = async () => {
  try {
    const count = await CakeModel.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default artisanal cakes into MongoDB...');
      await CakeModel.insertMany(INITIAL_CAKES);
      console.log('✅ Cakes seeded into MongoDB.');
    }
  } catch (e: any) {
    console.error('Failed to seed cakes in MongoDB:', e?.message || e);
  }
};

const seedDefaultAdmin = async () => {
  try {
    const count = await AdminModel.countDocuments();
    if (count === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
      const hash = await bcrypt.hash(defaultPassword, 10);
      await AdminModel.create({
        name: 'Campus Administrator',
        email: 'admin@cakecampus.edu',
        passwordHash: hash,
        role: 'superadmin'
      });
      console.log('👤 Default admin seeded in MongoDB: admin@cakecampus.edu / Admin@123');
    }
  } catch (e: any) {
    console.error('Failed to seed admin in MongoDB:', e?.message || e);
  }
};

// --- Repository Helpers ---

// Colleges
export const getColleges = async (includeInactive: boolean = false): Promise<CollegeDocument[]> => {
  if (isMongoConnected) {
    try {
      const query = includeInactive ? {} : { isActive: true };
      const list = await CollegeModel.find(query).sort({ name: 1 }).lean();
      if (list.length > 0) {
        return list.map((c: any) => ({
          ...c,
          _id: String(c._id),
          id: String(c._id)
        })) as CollegeDocument[];
      }
    } catch (err) {
      console.warn('Mongo read colleges error, reading local fallback', err);
    }
  }
  await ensureLocalSeed();
  try {
    const data: CollegeDocument[] = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));
    if (includeInactive) return data;
    return data.filter(c => c.isActive !== false);
  } catch {
    return [];
  }
};

export const createCollegeInDb = async (data: Partial<CollegeDocument>): Promise<CollegeDocument> => {
  const code = (data.code || data.name || `COL-${Date.now()}`).trim().toUpperCase();
  const collegePayload = {
    name: (data.name || '').trim(),
    code,
    location: (data.location || '').trim(),
    pickupPoint: (data.pickupPoint || 'CakeCampus Point').trim(),
    isActive: data.isActive ?? true
  };

  if (isMongoConnected) {
    try {
      const created = await CollegeModel.create(collegePayload);
      return { ...created.toObject(), _id: String(created._id), id: String(created._id) } as CollegeDocument;
    } catch (e) {
      console.warn('Mongo create college error:', e);
    }
  }
  await ensureLocalSeed();
  const list: CollegeDocument[] = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));
  const newCollege: CollegeDocument = {
    ...collegePayload,
    _id: `college-${Date.now()}`,
    id: `college-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  list.push(newCollege);
  fs.writeFileSync(collegesFile, JSON.stringify(list, null, 2));
  return newCollege;
};

export const deleteCollegeInDb = async (id: string): Promise<boolean> => {
  if (isMongoConnected) {
    try {
      if (mongoose.isValidObjectId(id)) {
        await CollegeModel.findByIdAndDelete(id);
      } else {
        await CollegeModel.findOneAndDelete({ $or: [{ _id: id }, { id }, { code: id }] });
      }
    } catch (e) {
      console.warn('Mongo delete college error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const list: CollegeDocument[] = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));
    const filtered = list.filter(c => c._id !== id && c.id !== id && c.code !== id);
    if (filtered.length !== list.length) {
      fs.writeFileSync(collegesFile, JSON.stringify(filtered, null, 2));
      return true;
    }
  } catch (err) {
    console.error('Delete college local file error:', err);
  }
  return true;
};

// Cakes
export const getCakes = async (includeHidden: boolean = false): Promise<CakeDocument[]> => {
  if (isMongoConnected) {
    try {
      const query = includeHidden ? {} : { isAvailable: true };
      const list = await CakeModel.find(query).lean();
      if (list.length > 0) {
        return list.map((c: any) => ({
          ...c,
          _id: String(c._id),
          id: String(c._id)
        })) as CakeDocument[];
      }
    } catch (err) {
      console.warn('Mongo read error, reading local fallback', err);
    }
  }
  await ensureLocalSeed();
  try {
    const data: CakeDocument[] = JSON.parse(fs.readFileSync(cakesFile, 'utf8'));
    if (includeHidden) return data;
    return data.filter(c => c.isAvailable !== false);
  } catch {
    return [];
  }
};

export const getCakeById = async (id: string): Promise<CakeDocument | null> => {
  const normId = (id || '').trim().toLowerCase();
  if (isMongoConnected) {
    try {
      if (mongoose.isValidObjectId(id)) {
        const found = await CakeModel.findById(id).lean();
        if (found) return { ...found, _id: String(found._id), id: String(found._id) } as CakeDocument;
      }
      const foundAlt = await CakeModel.findOne({
        $or: [
          { id: id },
          { _id: id },
          { id: normId },
          { name: new RegExp(`^${id}$`, 'i') }
        ]
      }).lean();
      if (foundAlt) return { ...foundAlt, _id: String(foundAlt._id), id: String(foundAlt._id) } as CakeDocument;
    } catch (e) {
      console.warn('Mongo find error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const list: CakeDocument[] = JSON.parse(fs.readFileSync(cakesFile, 'utf8'));
    // 1. Exact match by _id or id
    const exact = list.find(c => c._id === id || c.id === id);
    if (exact) return exact;

    // 2. Case-insensitive match
    const caseMatch = list.find(c => 
      (c._id && c._id.toLowerCase() === normId) || 
      (c.id && c.id.toLowerCase() === normId) ||
      (c.name && c.name.toLowerCase() === normId)
    );
    if (caseMatch) return caseMatch;

    // 3. Partial or number match (e.g. "cake-1" or "item-1" or "1")
    const numOnly = normId.replace(/\D/g, '');
    if (numOnly) {
      const numMatch = list.find(c => {
        const cNum = (c.id || c._id || '').replace(/\D/g, '');
        return cNum === numOnly;
      });
      if (numMatch) return numMatch;
    }

    // 4. Return closest matching or first cake
    return list[0] || null;
  } catch {
    return null;
  }
};

export const createCakeInDb = async (cakeData: Partial<CakeDocument>): Promise<CakeDocument> => {
  if (isMongoConnected) {
    try {
      const created = await CakeModel.create(cakeData);
      return { ...created.toObject(), _id: String(created._id), id: String(created._id) } as CakeDocument;
    } catch (e) {
      console.warn('Mongo create cake error:', e);
    }
  }
  await ensureLocalSeed();
  const list: CakeDocument[] = JSON.parse(fs.readFileSync(cakesFile, 'utf8'));
  const newCake: CakeDocument = {
    ...cakeData,
    _id: `item-${Date.now()}`,
    id: `item-${Date.now()}`,
    name: cakeData.name || 'New Item',
    description: cakeData.description || '',
    images: cakeData.images || ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'],
    isAvailable: cakeData.isAvailable ?? true,
    category: cakeData.category || 'General',
    itemType: cakeData.itemType || 'cake',
    weights: cakeData.weights || [{ key: '1kg', price: 650 }],
    flavours: cakeData.flavours || [{ key: 'Original', extra: 0 }],
    toppings: cakeData.toppings || [],
    addOns: cakeData.addOns || [],
    createdAt: new Date().toISOString()
  };
  list.unshift(newCake);
  fs.writeFileSync(cakesFile, JSON.stringify(list, null, 2));
  return newCake;
};

export const updateCakeInDb = async (id: string, updates: Partial<CakeDocument>): Promise<CakeDocument | null> => {
  if (isMongoConnected) {
    try {
      let updated: any = null;
      if (mongoose.isValidObjectId(id)) {
        updated = await CakeModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      }
      if (!updated) {
        updated = await CakeModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      }
      if (updated) return { ...updated, _id: String(updated._id), id: String(updated._id) } as CakeDocument;
    } catch (e) {
      console.warn('Mongo update cake error:', e);
    }
  }
  await ensureLocalSeed();
  const list: CakeDocument[] = JSON.parse(fs.readFileSync(cakesFile, 'utf8'));
  const idx = list.findIndex(c => c._id === id || c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    fs.writeFileSync(cakesFile, JSON.stringify(list, null, 2));
    return list[idx];
  }
  return null;
};

export const deleteCakeInDb = async (id: string): Promise<boolean> => {
  if (isMongoConnected) {
    try {
      if (mongoose.isValidObjectId(id)) {
        await CakeModel.findByIdAndDelete(id);
      } else {
        await CakeModel.findOneAndDelete({ id });
      }
    } catch (e) {
      console.warn('Mongo delete cake error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const list: CakeDocument[] = JSON.parse(fs.readFileSync(cakesFile, 'utf8'));
    const filtered = list.filter(c => c._id !== id && c.id !== id);
    if (filtered.length !== list.length) {
      fs.writeFileSync(cakesFile, JSON.stringify(filtered, null, 2));
      return true;
    }
  } catch (err) {
    console.error('Delete cake local file error:', err);
  }
  return true;
};

// Admins
export const findAdminByEmail = async (email: string): Promise<AdminDocument | null> => {
  const cleanEmail = email.trim().toLowerCase();
  if (isMongoConnected) {
    try {
      const admin = await AdminModel.findOne({ email: cleanEmail }).lean();
      if (admin) return { ...admin, _id: String(admin._id), id: String(admin._id) } as AdminDocument;
    } catch (e) {
      console.warn('Mongo admin lookup error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const admins: AdminDocument[] = JSON.parse(fs.readFileSync(adminsFile, 'utf8'));
    return admins.find(a => a.email.toLowerCase() === cleanEmail) || null;
  } catch {
    return null;
  }
};

export const getAdminById = async (id: string): Promise<AdminDocument | null> => {
  if (isMongoConnected) {
    try {
      const admin = await AdminModel.findById(id).lean();
      if (admin) return { ...admin, _id: String(admin._id), id: String(admin._id) } as AdminDocument;
    } catch (e) {
      console.warn('Mongo admin by id error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const admins: AdminDocument[] = JSON.parse(fs.readFileSync(adminsFile, 'utf8'));
    return admins.find(a => a.id === id || a._id === id) || null;
  } catch {
    return null;
  }
};

// Orders
export const saveOrder = async (orderData: OrderDocument): Promise<OrderDocument> => {
  if (isMongoConnected) {
    try {
      const created = await OrderModel.create(orderData);
      return { ...created.toObject(), _id: String(created._id), id: String(created._id) } as OrderDocument;
    } catch (err: any) {
      console.warn('Failed to save order in Mongo, saving locally:', err?.message || err);
    }
  }
  await ensureLocalSeed();
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const newDoc = {
      ...orderData,
      _id: orderData._id || `ord-${Date.now()}`,
      id: orderData.orderId,
    };
    orders.unshift(newDoc);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    return newDoc;
  } catch (err) {
    console.error('Local order save error:', err);
    return orderData;
  }
};

export const findOrderByOrderId = async (orderId: string): Promise<OrderDocument | null> => {
  if (isMongoConnected) {
    try {
      const found = await OrderModel.findOne({ orderId }).lean();
      if (found) return { ...found, _id: String(found._id), id: String(found._id) } as OrderDocument;
    } catch (e) {
      console.warn('Mongo find order error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    return orders.find(o => o.orderId.toLowerCase() === orderId.toLowerCase()) || null;
  } catch {
    return null;
  }
};

export const findOrdersForTracking = async (orderId: string, phoneOrEmail: string): Promise<OrderDocument | null> => {
  const cleanSearch = phoneOrEmail.trim().toLowerCase();
  if (isMongoConnected) {
    try {
      const found = await OrderModel.findOne({
        orderId: { $regex: new RegExp(`^${orderId}$`, 'i') },
        $or: [
          { 'customer.phone': cleanSearch },
          { 'customer.email': cleanSearch }
        ]
      }).lean();
      if (found) return { ...found, _id: String(found._id), id: String(found._id) } as OrderDocument;
    } catch (e) {
      console.warn('Mongo tracking error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    return orders.find(o => 
      o.orderId.toLowerCase() === orderId.toLowerCase() && 
      (o.customer.phone.toLowerCase() === cleanSearch || o.customer.email.toLowerCase() === cleanSearch)
    ) || null;
  } catch {
    return null;
  }
};

export const getAllOrders = async (): Promise<OrderDocument[]> => {
  if (isMongoConnected) {
    try {
      const list = await OrderModel.find().sort({ createdAt: -1 }).lean();
      return list.map((o: any) => ({ ...o, _id: String(o._id), id: String(o._id) })) as OrderDocument[];
    } catch (e) {
      console.warn('Mongo getAllOrders error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  } catch {
    return [];
  }
};

export const updateOrderStatusInDb = async (
  orderId: string, 
  status: OrderStatus, 
  paymentUpdates?: { 
    utr?: string; screenshotUrl?: string; submittedAt?: string | Date;
    verifiedAt?: string | Date; verifiedByAdminId?: string; rejectionReason?: string;
    verificationStatus?: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  },
  notionUpdates?: { pageId?: string; pageUrl?: string }
): Promise<OrderDocument | null> => {
  if (isMongoConnected) {
    try {
      const updatePayload: any = { 
        status, 
        updatedAt: new Date() 
      };
      if (paymentUpdates?.utr) updatePayload['payment.utr'] = paymentUpdates.utr;
      if (paymentUpdates?.screenshotUrl) updatePayload['payment.screenshotUrl'] = paymentUpdates.screenshotUrl;
      if (paymentUpdates?.submittedAt) updatePayload['payment.submittedAt'] = paymentUpdates.submittedAt;
      if (paymentUpdates?.verifiedAt) updatePayload['payment.verifiedAt'] = paymentUpdates.verifiedAt;
      if (paymentUpdates?.verifiedByAdminId) updatePayload['payment.verifiedByAdminId'] = paymentUpdates.verifiedByAdminId;
      if (paymentUpdates?.rejectionReason !== undefined) updatePayload['payment.rejectionReason'] = paymentUpdates.rejectionReason;
      if (paymentUpdates?.verificationStatus) updatePayload['payment.verificationStatus'] = paymentUpdates.verificationStatus;
      if (notionUpdates?.pageId) updatePayload['notion.pageId'] = notionUpdates.pageId;
      if (notionUpdates?.pageUrl) updatePayload['notion.pageUrl'] = notionUpdates.pageUrl;

      const updated = await OrderModel.findOneAndUpdate(
        { orderId },
        { $set: updatePayload },
        { new: true }
      ).lean();

      if (updated) {
        return { ...updated, _id: String(updated._id), id: String(updated._id) } as OrderDocument;
      }
    } catch (e) {
      console.warn('Mongo order status update error:', e);
    }
  }

  await ensureLocalSeed();
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const idx = orders.findIndex(o => o.orderId.toLowerCase() === orderId.toLowerCase());
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      if (paymentUpdates) {
        const p = orders[idx].payment;
        if (paymentUpdates.utr) p.utr = paymentUpdates.utr;
        if (paymentUpdates.screenshotUrl) p.screenshotUrl = paymentUpdates.screenshotUrl;
        if (paymentUpdates.submittedAt) p.submittedAt = paymentUpdates.submittedAt;
        if (paymentUpdates.verifiedAt) p.verifiedAt = paymentUpdates.verifiedAt;
        if (paymentUpdates.verifiedByAdminId) p.verifiedByAdminId = paymentUpdates.verifiedByAdminId;
        if (paymentUpdates.rejectionReason !== undefined) p.rejectionReason = paymentUpdates.rejectionReason;
        if (paymentUpdates.verificationStatus) p.verificationStatus = paymentUpdates.verificationStatus;
      }
      if (notionUpdates?.pageId) {
        orders[idx].notion = { ...orders[idx].notion, pageId: notionUpdates.pageId, pageUrl: notionUpdates.pageUrl };
      }
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      return orders[idx];
    }
  } catch (err) {
    console.error('Failed to update local order:', err);
  }
  return null;
};

// --- Customer User Helpers ---

export const findUserByEmail = async (email: string): Promise<CustomerUserDocument | null> => {
  const cleanEmail = email.trim().toLowerCase();
  if (isMongoConnected) {
    try {
      const user = await UserModel.findOne({ email: cleanEmail }).lean();
      if (user) return { ...user, _id: String(user._id), id: String(user._id) } as CustomerUserDocument;
    } catch (e) {
      console.warn('Mongo findUserByEmail error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  } catch {
    return null;
  }
};

export const findUserById = async (id: string): Promise<CustomerUserDocument | null> => {
  if (isMongoConnected) {
    try {
      const user = await UserModel.findById(id).lean();
      if (user) return { ...user, _id: String(user._id), id: String(user._id) } as CustomerUserDocument;
    } catch (e) {
      console.warn('Mongo findUserById error:', e);
    }
  }
  await ensureLocalSeed();
  try {
    const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    return users.find(u => u.id === id || u._id === id) || null;
  } catch {
    return null;
  }
};

export const createOrUpdateGoogleUser = async (data: {
  name: string;
  email: string;
  googleId?: string;
  avatarUrl?: string;
  password?: string;
  phone?: string;
  rollNumber?: string;
  college?: string;
}): Promise<CustomerUserDocument> => {
  const cleanEmail = data.email.trim().toLowerCase();
  let passwordHash: string | undefined = undefined;
  if (data.password && data.password.trim().length >= 4) {
    passwordHash = await bcrypt.hash(data.password.trim(), 10);
  }

  if (isMongoConnected) {
    try {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        if (data.name) existing.name = data.name;
        if (data.googleId) existing.googleId = data.googleId;
        if (data.avatarUrl) existing.avatarUrl = data.avatarUrl;
        if (data.phone) existing.phone = data.phone;
        if (data.rollNumber) existing.rollNumber = data.rollNumber;
        if (data.college) existing.college = data.college;
        if (passwordHash) existing.passwordHash = passwordHash;
        await existing.save();
        const obj = existing.toObject();
        return { ...obj, _id: String(obj._id), id: String(obj._id) } as CustomerUserDocument;
      } else {
        const created = await UserModel.create({
          name: data.name,
          email: cleanEmail,
          googleId: data.googleId,
          avatarUrl: data.avatarUrl,
          phone: data.phone || '',
          rollNumber: data.rollNumber || '',
          college: data.college || '',
          passwordHash: passwordHash || '',
          role: 'customer'
        });
        const obj = created.toObject();
        return { ...obj, _id: String(obj._id), id: String(obj._id) } as CustomerUserDocument;
      }
    } catch (e) {
      console.warn('Mongo createOrUpdateGoogleUser error:', e);
    }
  }

  await ensureLocalSeed();
  const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (idx !== -1) {
    if (data.name) users[idx].name = data.name;
    if (data.googleId) users[idx].googleId = data.googleId;
    if (data.avatarUrl) users[idx].avatarUrl = data.avatarUrl;
    if (data.phone) users[idx].phone = data.phone;
    if (data.rollNumber) users[idx].rollNumber = data.rollNumber;
    if (data.college) users[idx].college = data.college;
    if (passwordHash) users[idx].passwordHash = passwordHash;
    users[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return users[idx];
  } else {
    const newUser: CustomerUserDocument = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      email: cleanEmail,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl,
      phone: data.phone || '',
      rollNumber: data.rollNumber || '',
      college: data.college || '',
      passwordHash: passwordHash || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return newUser;
  }
};

export const createCustomerUser = async (data: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  rollNumber?: string;
  college?: string;
  avatarUrl?: string;
}): Promise<CustomerUserDocument> => {
  const cleanEmail = data.email.trim().toLowerCase();
  let passwordHash = '';
  if (data.password && data.password.trim()) {
    passwordHash = await bcrypt.hash(data.password.trim(), 10);
  }

  if (isMongoConnected) {
    try {
      const created = await UserModel.create({
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: data.phone?.trim() || '',
        rollNumber: data.rollNumber?.trim() || '',
        college: data.college?.trim() || '',
        avatarUrl: data.avatarUrl || '',
        role: 'customer'
      });
      const obj = created.toObject();
      return { ...obj, _id: String(obj._id), id: String(obj._id) } as CustomerUserDocument;
    } catch (e) {
      console.warn('Mongo createCustomerUser error:', e);
    }
  }

  await ensureLocalSeed();
  const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const newUser: CustomerUserDocument = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    _id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name.trim(),
    email: cleanEmail,
    passwordHash,
    phone: data.phone?.trim() || '',
    rollNumber: data.rollNumber?.trim() || '',
    college: data.college?.trim() || '',
    avatarUrl: data.avatarUrl || '',
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return newUser;
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
  if (isMongoConnected) {
    try {
      const updated = await UserModel.findByIdAndUpdate(userId, { $set: { passwordHash } });
      if (updated) return true;
    } catch (e) {
      console.warn('Mongo updateUserPassword error:', e);
    }
  }
  await ensureLocalSeed();
  const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const idx = users.findIndex(u => u.id === userId || u._id === userId);
  if (idx !== -1) {
    users[idx].passwordHash = passwordHash;
    users[idx].updatedAt = new Date().toISOString();
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  }
  return false;
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<CustomerUserDocument>
): Promise<CustomerUserDocument | null> => {
  if (isMongoConnected) {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        userId, 
        { $set: updates }, 
        { new: true }
      ).lean();
      if (updated) return { ...updated, _id: String(updated._id), id: String(updated._id) } as CustomerUserDocument;
    } catch (e) {
      console.warn('Mongo updateUserProfile error:', e);
    }
  }
  await ensureLocalSeed();
  const users: CustomerUserDocument[] = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const idx = users.findIndex(u => u.id === userId || u._id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return users[idx];
  }
  return null;
};

export const getOrdersForCustomer = async (email: string, phone?: string): Promise<OrderDocument[]> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone?.trim();

  if (isMongoConnected) {
    try {
      const query: any = {
        $or: [{ 'customer.email': cleanEmail }]
      };
      if (cleanPhone) {
        query.$or.push({ 'customer.phone': cleanPhone });
      }
      const list = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return list.map((o: any) => ({ ...o, _id: String(o._id), id: String(o._id) })) as OrderDocument[];
    } catch (e) {
      console.warn('Mongo getOrdersForCustomer error:', e);
    }
  }

  await ensureLocalSeed();
  try {
    const orders: OrderDocument[] = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    return orders.filter(o => 
      o.customer.email.toLowerCase() === cleanEmail || 
      (cleanPhone && o.customer.phone === cleanPhone)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
};
