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

export interface CakeItem {
  _id?: string;
  id: string;
  name: string;
  description: string;
  images: string[];
  isAvailable: boolean;
  category?: string;
  itemType?: 'cake' | 'biscuit';
  weights: WeightOption[];
  flavours: FlavourOption[];
  toppings: ToppingOption[];
  addOns: AddOnOption[];
}

export interface CollegeItem {
  _id?: string;
  id: string;
  name: string;
  code: string;
  location?: string;
  pickupPoint: string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  college?: string;
  avatarUrl?: string;
  hasPassword?: boolean;
}

export interface CartItem {
  id: string; // generated unique cart line item id
  cakeId: string;
  cakeName: string;
  image: string;
  weightKey: string;
  weightPrice: number;
  flavourKey: string;
  flavourExtra: number;
  toppingKeys: string[];
  toppingsExtra: number;
  addOnKeys: string[];
  addOnsExtra: number;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export type CanonicalOrderStatus = 
  | 'PAYMENT_PENDING' 
  | 'PAYMENT_SUBMITTED' 
  | 'PAID_VERIFIED' 
  | 'PAYMENT_REJECTED'
  | 'PREPARING' 
  | 'READY_FOR_PICKUP' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  rollNumber: string;
  college?: string;
}

export interface OrderData {
  _id?: string;
  orderId: string; // "CC-XXXXXX"
  customer: CustomerInfo;
  college?: string;
  cakeMessage?: string;
  pickupDate: string;
  pickupPoint: string; // "CakeCampus Point"
  items: {
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
  }[];
  itemsTotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: CanonicalOrderStatus;
  payment: {
    method: 'UPI_QR';
    upiId: string;
    payeeName: string;
    upiNote: string;
    utr?: string;
    screenshotUrl?: string;
    submittedAt?: string;
    verifiedAt?: string;
    verificationStatus: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
  };
  notion?: {
    pageId?: string;
    pageUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type ScreenType = 
  | 'signin'
  | 'college-select'
  | 'home'
  | 'catalog'
  | 'cake-detail'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'track'
  | 'admin';
