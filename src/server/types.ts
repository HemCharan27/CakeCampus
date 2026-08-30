export interface WeightOption {
  key: string; // e.g. "0.5kg", "1kg", "2kg"
  price: number;
}

export interface FlavourOption {
  key: string; // e.g. "Chocolate", "Vanilla", "Red Velvet"
  extra: number;
}

export interface ToppingOption {
  key: string; // e.g. "Choco chips", "Oreo"
  extra: number;
}

export interface AddOnOption {
  key: string; // e.g. "Candles", "Knife", "Sparkler Candle"
  extra: number;
}

export interface CakeDocument {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  images: string[];
  isAvailable: boolean;
  weights: WeightOption[];
  flavours: FlavourOption[];
  toppings: ToppingOption[];
  addOns: AddOnOption[];
  category?: string;
  itemType?: 'cake' | 'biscuit';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CollegeDocument {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  location?: string;
  pickupPoint: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CustomerUserDocument {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  college?: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  role: 'customer';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminDocument {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderItemSnapshot {
  cakeId: string;
  cakeNameSnapshot: string;
  image?: string;
  weightKey: string;
  weightPriceSnapshot: number;
  flavourKey: string;
  flavourExtraSnapshot: number;
  toppingKeys: string[];
  toppingsExtraSnapshot: number;
  addOnKeys: string[];
  addOnsExtraSnapshot: number;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export type OrderStatus = 
  | 'PAYMENT_PENDING' 
  | 'PAYMENT_SUBMITTED' 
  | 'PAID_VERIFIED' 
  | 'PAYMENT_REJECTED'
  | 'PREPARING' 
  | 'READY_FOR_PICKUP' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  rollNumber: string;
  college?: string;
}

export interface PaymentDetails {
  method: 'UPI_QR';
  upiId: string;
  payeeName: string;
  upiNote: string;
  utr?: string;
  screenshotUrl?: string;
  submittedAt?: string | Date;
  verifiedAt?: string | Date;
  verifiedByAdminId?: string;
  rejectionReason?: string;
  verificationStatus: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
}

export interface NotionDetails {
  pageId?: string;
  pageUrl?: string;
  syncedAt?: string | Date;
}

export interface OrderDocument {
  _id?: string;
  id?: string;
  orderId: string; // human-friendly unique e.g. "CC-000123"
  customer: CustomerDetails;
  college?: string;
  cakeMessage?: string;
  pickupDate: string | Date; // stored as ISO date string or Date
  pickupPoint: string; // "CakeCampus Point"
  items: OrderItemSnapshot[];
  itemsTotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  payment: PaymentDetails;
  notion?: NotionDetails;
  emailSentToCustomer?: boolean;
  emailSentToAdmin?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOrderRequest {
  customer: CustomerDetails;
  college?: string;
  cakeMessage?: string;
  pickupDate: string; // "YYYY-MM-DD"
  items: {
    cakeId: string;
    weightKey: string;
    flavourKey: string;
    toppingKeys?: string[];
    addOnKeys?: string[];
    qty: number;
  }[];
}
