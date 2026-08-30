# 🎂 CakeCampus - Campus Cake Pre-Order Portal

**CakeCampus** is a dedicated web application for college students to pre-order fresh artisanal cakes for scheduled pickup at a fixed on-campus counter (**“CakeCampus Point”**).

---

## 🚀 Key Features & Business Rules

1. **Strict Pre-Order Cutoff Enforcement**:
   - For pickup on date **D**, orders must be placed before **(D - 1) 6:00 PM IST** (`Asia/Kolkata`).
   - If current time exceeds the cutoff, orders for next-day pickup are blocked on both client date picker and server validation.
2. **Fixed On-Campus Pickup**:
   - Fixed pickup point at **CakeCampus Point** (Student Activity Center Ground Floor).
3. **Configurable Delivery Charge**:
   - Current default is ₹50 per order; admins can update it from the protected settings endpoint.
4. **Cart Line Items Limit & Deduplication**:
   - Maximum **3 distinct line items** per order.
   - Adding the same cake with the identical weight, flavour, toppings, and add-ons automatically increments the quantity instead of creating a duplicate line item.
5. **Dynamic Item Options & Server-Side Recalculation**:
   - **Weight**: 0.5kg, 1kg, 2kg
   - **Flavours**: e.g., Chocolate, Vanilla (+₹10), Red Velvet (+₹20)
   - **Toppings**: e.g., Choco chips (+₹10), Oreo (+₹20), Fresh Berries (+₹25)
   - **Add-ons**: Candles (+₹10), Knife (+₹10), Sparkler Candle (+₹25)
   - Unit price and totals are validated and calculated securely on the server to prevent price tampering.
6. **Manual UPI Payment Verification**:
   - Orders are created as `PAYMENT_PENDING` and show a UPI QR/deep link.
   - Customers submit a UTR and optional screenshot; admins verify manually.
7. **MongoDB (Operational Source of Truth) & Notion Admin Mirror**:
   - Full operational order data is stored in MongoDB (`cakes` and `orders` collections).
   - Real-time mirroring to Notion database ("CakeCampus Orders") for easy administrative viewing.
8. **Transactional Email Notifications**:
   - Automated customer emails for order receipt and payment verification.
9. **Real-time Order Tracking**:
   - Students can track their order lifecycle using their **Order ID** (`CC-XXXXXX`) and phone number or email.
   - Canonical status workflow: `PAYMENT_PENDING` → `PAYMENT_SUBMITTED` → `PAID_VERIFIED` → `PREPARING` → `READY_FOR_PICKUP` → `COMPLETED` (or `CANCELLED`).
10. **Password-Protected Admin Portal**:
    - Accessible at `/admin` with single admin password (default: `admin123`).
    - Real-time order status updates that automatically mirror back to Notion.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Mongoose (MongoDB), Luxon (Timezones), Nodemailer, Notion SDK (`@notionhq/client`)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
API_PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/cakecampus
ADMIN_PASSWORD=admin123
CAMPUS_UPI_ID=cakecampus@okhdfcbank
CAMPUS_UPI_PAYEE_NAME=CakeCampus
NOTION_TOKEN=secret_your_notion_token
NOTION_DATABASE_ID=your_notion_database_id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=CakeCampus Orders <orders@cakecampus.edu>
OWNER_EMAIL=admin@cakecampus.edu
```

*(Note: The app includes an integrated local store fallback if MongoDB or Notion keys are not configured.)*

### 3. Run the Backend API Server
```bash
npm run server
```

### 4. Run the Frontend Development Server
```bash
npm run dev
```

### 5. Run Automated Tests
```bash
npm run test:e2e
```

---

## 📡 API Reference

- `GET /api/cakes` — Fetch list of available cakes with options & prices
- `GET /api/cakes/:id` — Fetch details for a specific cake
- `POST /api/orders` — Create a `PAYMENT_PENDING` order + UPI instructions + Notion row
- `POST /api/uploads/payment-proof` — Store an optional payment screenshot and return its URL
- `POST /api/orders/:orderId/payment-proof` — Submit UTR and optional screenshot URL
- `PATCH /api/admin/orders/:orderId/verify-payment` — Admin verify or reject payment
- `PATCH /api/admin/settings/delivery-charge` — Update the configurable delivery charge
- `GET /api/orders/track?orderId=CC-XXXXXX&phone=...` — Student order tracking
- `GET /api/admin/orders` — List all orders (requires `X-Admin-Password`)
- `PATCH /api/admin/orders/:orderId/status` — Update order status and sync to Notion (requires `X-Admin-Password`)
