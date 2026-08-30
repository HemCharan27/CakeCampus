import { checkPickupCutoff, validateAndCalculateOrder } from './src/server/pricingAndCutoff';
import { 
  getCakes, 
  getCakeById, 
  saveOrder, 
  findOrderByOrderId, 
  findOrdersForTracking, 
  updateOrderStatusInDb,
  findAdminByEmail,
  createCakeInDb,
  updateCakeInDb,
  deleteCakeInDb,
  createCustomerUser,
  createOrUpdateGoogleUser,
  getOrdersForCustomer,
  getColleges,
  createCollegeInDb,
  deleteCollegeInDb,
  updateUserProfile
} from './src/server/models';
import { DateTime } from 'luxon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const IST_ZONE = 'Asia/Kolkata';
const JWT_SECRET = process.env.JWT_SECRET || 'cakecampus_secret_key_2026_campus_auth';

async function runTests() {
  console.log('🧪 Starting CakeCampus E2E Automated Tests (V2)...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // --- 1. Test Cutoff Logic & Mandatory Date ---
  console.log('--- 1. Testing Pre-Order Cutoff Rules (Previous Day 6:00 PM IST) ---');
  const nowIST = DateTime.now().setZone(IST_ZONE);

  // Missing / empty date
  const emptyDateCutoff = checkPickupCutoff('');
  assert(emptyDateCutoff.isValid === false, `Empty date rejected: "${emptyDateCutoff.reason}"`);

  // Far future date (+5 days) should ALWAYS be valid
  const futureDate = nowIST.plus({ days: 5 }).toFormat('yyyy-MM-dd');
  const futureCutoff = checkPickupCutoff(futureDate);
  assert(futureCutoff.isValid === true, `Future date (${futureDate}) is valid for pre-order`);

  // Yesterday date should be rejected with exact required message
  const pastDate = nowIST.minus({ days: 1 }).toFormat('yyyy-MM-dd');
  const pastCutoff = checkPickupCutoff(pastDate);
  assert(
    pastCutoff.isValid === false && pastCutoff.reason === 'Orders for this date close at 6:00 PM the previous day.',
    `Past date rejected with exact message: "${pastCutoff.reason}"`
  );

  // Same-day date (today) rejected
  const todayDate = nowIST.toFormat('yyyy-MM-dd');
  const todayCutoff = checkPickupCutoff(todayDate);
  assert(todayCutoff.isValid === false, `Same-day pickup (${todayDate}) is rejected`);

  // --- 2. Test Cake Catalog & Option Lookup ---
  console.log('\n--- 2. Testing Database Models & Cake Catalog ---');
  const cakes = await getCakes();
  assert(cakes.length > 0, `Catalog contains ${cakes.length} cakes`);

  const firstCake = cakes[0];
  assert(!!firstCake.weights && firstCake.weights.length > 0, `First cake has valid weight tiers`);
  assert(!!firstCake.flavours && firstCake.flavours.length > 0, `First cake has valid flavour options`);

  // --- 3. Test Pricing Validation & 3-Line-Item Limit ---
  console.log('\n--- 3. Testing Pricing Recalculation & Business Rules ---');
  
  const validCalculation = await validateAndCalculateOrder([
    {
      cakeId: String(firstCake._id || firstCake.id),
      weightKey: firstCake.weights[0].key,
      flavourKey: firstCake.flavours[0].key,
      toppingKeys: firstCake.toppings.length > 0 ? [firstCake.toppings[0].key] : [],
      addOnKeys: firstCake.addOns.length > 0 ? [firstCake.addOns[0].key] : [],
      qty: 2
    }
  ]);

  const expectedWeightPrice = firstCake.weights[0].price;
  const expectedFlavourExtra = firstCake.flavours[0].extra;
  const expectedToppingsExtra = firstCake.toppings.length > 0 ? firstCake.toppings[0].extra : 0;
  const expectedAddOnsExtra = firstCake.addOns.length > 0 ? firstCake.addOns[0].extra : 0;
  const expectedUnit = expectedWeightPrice + expectedFlavourExtra + expectedToppingsExtra + expectedAddOnsExtra;
  const expectedLine = expectedUnit * 2;
  const expectedTotal = expectedLine + 50; // Configurable delivery charge defaults to ₹50

  assert(validCalculation.items[0].unitPrice === expectedUnit, `Unit price calculated correctly: ₹${validCalculation.items[0].unitPrice}`);
  assert(validCalculation.itemsTotal === expectedLine, `Items total calculated correctly: ₹${validCalculation.itemsTotal}`);
  assert(validCalculation.deliveryCharge === 50, `Delivery charge defaults to ₹50`);
  assert(validCalculation.totalAmount === expectedTotal, `Total amount calculated correctly: ₹${validCalculation.totalAmount}`);

  // Integer paise verification
  const paiseAmount = Math.round(validCalculation.totalAmount * 100);
  assert(Number.isInteger(paiseAmount) && paiseAmount === expectedTotal * 100, `Total amount represented in paise: ${paiseAmount} paise`);

  // Max 3 distinct line items
  let limitRejected = false;
  try {
    await validateAndCalculateOrder([
      { cakeId: String(firstCake._id || firstCake.id), weightKey: firstCake.weights[0].key, flavourKey: firstCake.flavours[0].key, qty: 1 },
      { cakeId: String(firstCake._id || firstCake.id), weightKey: firstCake.weights[0].key, flavourKey: firstCake.flavours[0].key, qty: 1 },
      { cakeId: String(firstCake._id || firstCake.id), weightKey: firstCake.weights[0].key, flavourKey: firstCake.flavours[0].key, qty: 1 },
      { cakeId: String(firstCake._id || firstCake.id), weightKey: firstCake.weights[0].key, flavourKey: firstCake.flavours[0].key, qty: 1 }
    ]);
  } catch (err: any) {
    if (err.message.includes('limit') || err.message.includes('maximum 3')) {
      limitRejected = true;
    }
  }
  assert(limitRejected, `Rejected cart with > 3 distinct line items`);

  // --- 4. Test Admin Authentication & JWT Verification ---
  console.log('\n--- 4. Testing Admin Authentication System (Bcrypt + JWT) ---');
  const admin = await findAdminByEmail('admin@cakecampus.edu');
  assert(admin !== null, `Default admin found in database (admin@cakecampus.edu)`);

  const passwordMatches = await bcrypt.compare('Admin@123', admin!.passwordHash);
  assert(passwordMatches === true, `Bcrypt hash verifies password "Admin@123"`);

  const wrongPasswordMatches = await bcrypt.compare('WrongPassword', admin!.passwordHash);
  assert(wrongPasswordMatches === false, `Bcrypt rejects incorrect password`);

  const token = jwt.sign({ adminId: admin!.id || admin!._id, email: admin!.email }, JWT_SECRET, { expiresIn: '1h' });
  const decoded: any = jwt.verify(token, JWT_SECRET);
  assert(decoded.email === 'admin@cakecampus.edu', `JWT session token generated and decoded successfully`);

  // --- 5. Test Order Lifecycle & Status Transitions ---
  console.log('\n--- 5. Testing Order Lifecycle & Status ---');
  const testOrderId = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDoc = {
    orderId: testOrderId,
    customer: {
      name: 'Rohan Sharma',
      phone: '9876543210',
      email: 'rohan.sharma@college.edu',
      rollNumber: '22CS104'
    },
    cakeMessage: 'Happy Birthday Rohan!',
    pickupDate: new Date(`${futureDate}T00:00:00.000Z`),
    pickupPoint: 'CakeCampus Point',
    items: validCalculation.items,
    itemsTotal: validCalculation.itemsTotal,
    deliveryCharge: 50,
    totalAmount: validCalculation.totalAmount,
    status: 'PAYMENT_PENDING' as const,
    payment: {
      method: 'UPI_QR' as const,
      upiId: 'cakecampus@okhdfcbank',
      payeeName: 'CakeCampus',
      upiNote: `CakeCampus ${testOrderId}`,
      verificationStatus: 'PENDING' as const
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = await saveOrder(orderDoc);
  assert(saved.orderId === testOrderId, `Order saved with ID ${saved.orderId}`);

  const tracked = await findOrdersForTracking(testOrderId, '9876543210');
  assert(tracked !== null && tracked.orderId === testOrderId, `Order found via tracking by Phone`);

  const submittedOrder = await updateOrderStatusInDb(testOrderId, 'PAYMENT_SUBMITTED', {
    utr: '123456789012',
    submittedAt: new Date().toISOString(),
    verificationStatus: 'SUBMITTED'
  });
  assert(submittedOrder?.status === 'PAYMENT_SUBMITTED', `Status updated to PAYMENT_SUBMITTED`);

  const preparingOrder = await updateOrderStatusInDb(testOrderId, 'PREPARING');
  assert(preparingOrder?.status === 'PREPARING', `Status updated to PREPARING`);

  const readyOrder = await updateOrderStatusInDb(testOrderId, 'READY_FOR_PICKUP');
  assert(readyOrder?.status === 'READY_FOR_PICKUP', `Status updated to READY_FOR_PICKUP`);

  // --- 6. Test Admin Full Catalog CRUD & Deletion ---
  console.log('\n--- 6. Testing Admin Full Catalog CRUD & Live Edit Capabilities ---');
  const tempCake = await createCakeInDb({
    name: 'Test Pistachio Crunch',
    description: 'Temporary test item for verification',
    category: 'Nutty',
    itemType: 'biscuit',
    weights: [{ key: '250g Pack', price: 200 }, { key: '500g Pack', price: 380 }],
    flavours: [{ key: 'Original', extra: 0 }],
    toppings: [{ key: 'Pistachio Crumbs', extra: 15 }],
    addOns: [{ key: 'Gift Box', extra: 30 }],
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80']
  });
  assert(tempCake.name === 'Test Pistachio Crunch', `Created test item successfully`);

  const updatedTemp = await updateCakeInDb(tempCake.id || tempCake._id!, {
    name: 'Royal Pistachio Crunch Luxe',
    description: 'Updated description for live verification',
    weights: [{ key: '250g Pack', price: 220 }, { key: '500g Pack', price: 400 }]
  });
  // --- 7. Test Customer Authentication & Google Flow with Saved Password ---
  console.log('\n--- 7. Testing Customer Auth (Google Flow, Password Save & Order History) ---');
  const testCustomer = await createCustomerUser({
    name: 'Charan Veesam',
    email: `charan.test.${Date.now()}@college.edu`,
    password: 'StudentPassword@123',
    phone: '9848034567',
    rollNumber: '21VV1A0589'
  });
  assert(testCustomer.name === 'Charan Veesam', `Created customer user account`);
  assert(!!testCustomer.passwordHash && testCustomer.passwordHash.length > 0, `Password was hashed securely with bcrypt`);

  const customerPassMatch = await bcrypt.compare('StudentPassword@123', testCustomer.passwordHash!);
  assert(customerPassMatch === true, `Customer bcrypt hash verifies correct password`);

  const customerWrongPass = await bcrypt.compare('WrongPassword', testCustomer.passwordHash!);
  assert(customerWrongPass === false, `Customer bcrypt rejects incorrect password`);

  // Google User with Saved Password
  const googleUser = await createOrUpdateGoogleUser({
    name: 'Ananya Sharma',
    email: `ananya.google.${Date.now()}@college.edu`,
    googleId: 'google_oauth_12345',
    password: 'AnanyaSecurePassword!456',
    rollNumber: '22CS104',
    phone: '9876501234'
  });
  assert(googleUser.googleId === 'google_oauth_12345', `Google user created with Google ID`);
  assert(!!googleUser.passwordHash, `Google user set and saved password for future direct login`);

  const googlePassMatch = await bcrypt.compare('AnanyaSecurePassword!456', googleUser.passwordHash!);
  assert(googlePassMatch === true, `Google user's saved password verified successfully`);

  const customerOrdersList = await getOrdersForCustomer(orderDoc.customer.email);
  assert(customerOrdersList.length > 0, `Retrieved customer order history successfully (${customerOrdersList.length} orders)`);

  // --- 8. Test Campus / College Directory CRUD & Selection ---
  console.log('\n--- 8. Testing Campus / College Directory CRUD & Student Selection ---');
  const collegesList = await getColleges();
  assert(collegesList.length >= 5, `Initial colleges list loaded successfully (${collegesList.length} colleges)`);

  const createdCollege = await createCollegeInDb({
    name: 'IIIT Hyderabad',
    code: 'IIITH',
    location: 'Gachibowli, Hyderabad',
    pickupPoint: 'Vindhya Canteen Counter'
  });
  assert(createdCollege.name === 'IIIT Hyderabad', `Created new college "${createdCollege.name}"`);
  assert(createdCollege.code === 'IIITH', `College code formatted correctly: ${createdCollege.code}`);

  const updatedUserWithCollege = await updateUserProfile(testCustomer.id || testCustomer._id!, {
    college: 'IIIT Hyderabad'
  });
  assert(updatedUserWithCollege?.college === 'IIIT Hyderabad', `Selected college linked to student profile: "${updatedUserWithCollege?.college}"`);

  const deleteSuccess = await deleteCollegeInDb(createdCollege.id || createdCollege._id!);
  assert(deleteSuccess === true, `Deleted test college successfully`);

  const collegesAfterDelete = await getColleges();
  assert(!collegesAfterDelete.some(c => c.id === createdCollege.id || c._id === createdCollege._id), `College removed from active list`);

  console.log(`\n🎉 Test Suite Completed: ${passed}/${total} assertions passed.`);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
