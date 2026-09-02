import React, { createContext, useContext, useState, useEffect } from 'react';
import { CakeItem, CartItem, OrderData, ScreenType, AdminUser, CustomerUser, CollegeItem } from '../types';
import { INITIAL_CAKES } from '../server/seedData';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase';

interface AppContextType {
  // Navigation
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  selectedCake: CakeItem | null;
  setSelectedCake: (cake: CakeItem | null) => void;

  // Catalog
  cakes: CakeItem[];
  isLoadingCakes: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  fetchCakes: (includeHidden?: boolean) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'lineTotal'>) => { success: boolean; message?: string };
  updateCartQty: (id: string, newQty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemsTotal: number;
  deliveryCharge: number;
  grandTotal: number;

  // Order & Tracking
  lastCreatedOrder: OrderData | null;
  setLastCreatedOrder: (order: OrderData | null) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;
  trackingPhoneOrEmail: string;
  setTrackingPhoneOrEmail: (val: string) => void;

  // Admin Auth
  adminToken: string | null;
  adminUser: AdminUser | null;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  checkAdminAuth: () => Promise<boolean>;

  // Customer Auth
  customerToken: string | null;
  customerUser: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'google';
  setAuthModalMode: (mode: 'login' | 'register' | 'google') => void;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (data: { name: string; email: string; googleId?: string; avatarUrl?: string; password?: string; phone?: string; rollNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: { name: string; email: string; password: string; phone?: string; rollNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  logoutCustomer: () => Promise<void>;
  updateCustomerProfile: (updates: { name?: string; phone?: string; rollNumber?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  customerOrders: OrderData[];
  fetchCustomerOrders: () => Promise<void>;

  // Colleges / Campus
  colleges: CollegeItem[];
  isLoadingColleges: boolean;
  selectedCollege: CollegeItem | null;
  fetchColleges: () => Promise<void>;
  selectCollege: (collegeNameOrObj: string | CollegeItem) => Promise<{ success: boolean; error?: string }>;

  // Helpers
  formatPrice: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getUserCartStorageKey = (user?: CustomerUser | null): string => {
  const identifier = user?.email || user?.id;
  return identifier ? `cakecampus_cart_${identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : 'cakecampus_cart_guest';
};

const LAST_ORDER_KEY = 'cakecampus_last_order_v2';
const ADMIN_TOKEN_KEY = 'cakecampus_admin_token_v2';
const CUSTOMER_TOKEN_KEY = 'cakecampus_customer_token_v2';
const COLLEGE_STORAGE_KEY = 'cakecampus_selected_college_v2';

const getInitialScreen = (): ScreenType => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path === '/admin' || hash === '#admin') return 'admin';
  if (path === '/catalog' || hash === '#catalog') return 'catalog';
  if (path === '/cart' || hash === '#cart') return 'cart';
  if (path === '/checkout' || hash === '#checkout') return 'checkout';
  if (path === '/success' || hash === '#success') return 'success';
  if (path === '/track' || hash === '#track') return 'track';
  return 'home';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreenState] = useState<ScreenType>(getInitialScreen());
  const [cakes, setCakes] = useState<CakeItem[]>(INITIAL_CAKES as CakeItem[]);
  const [isLoadingCakes, setIsLoadingCakes] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeItem | null>(INITIAL_CAKES[0] as CakeItem);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // College / Campus State
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [selectedCollege, setSelectedCollegeState] = useState<CollegeItem | null>(() => {
    try {
      const saved = localStorage.getItem(COLLEGE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setCurrentScreen = (screen: ScreenType) => {
    setCurrentScreenState(screen);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const targetPath = screen === 'admin' ? '/admin' : screen === 'home' ? '/' : `/${screen}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ screen }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin') setCurrentScreenState('admin');
      else if (path === '/catalog' || hash === '#catalog') setCurrentScreenState('catalog');
      else if (path === '/cart' || hash === '#cart') setCurrentScreenState('cart');
      else if (path === '/checkout' || hash === '#checkout') setCurrentScreenState('checkout');
      else if (path === '/success' || hash === '#success') setCurrentScreenState('success');
      else if (path === '/track' || hash === '#track') setCurrentScreenState('track');
      else setCurrentScreenState('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Customer Auth State
  const [customerToken, setCustomerToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'google'>('login');
  const [customerOrders, setCustomerOrders] = useState<OrderData[]>([]);

  // Load user-scoped Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // When customer user identity loads or switches, load their own saved cart
  useEffect(() => {
    try {
      const key = getUserCartStorageKey(customerUser);
      const saved = localStorage.getItem(key);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [customerUser?.id, customerUser?.email]);

  const [lastCreatedOrder, setLastCreatedOrder] = useState<OrderData | null>(() => {
    try {
      const saved = localStorage.getItem(LAST_ORDER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingPhoneOrEmail, setTrackingPhoneOrEmail] = useState('');

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Sync selected college to local storage
  useEffect(() => {
    try {
      if (selectedCollege) {
        localStorage.setItem(COLLEGE_STORAGE_KEY, JSON.stringify(selectedCollege));
      } else {
        localStorage.removeItem(COLLEGE_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save selected college to localStorage', e);
    }
  }, [selectedCollege]);

  // Sync selected college when customerUser profile has a college
  useEffect(() => {
    if (customerUser?.college) {
      // Find matching college or set fallback item
      setSelectedCollegeState((prev: CollegeItem | null) => {
        if (prev?.name === customerUser.college) return prev;
        const matched = colleges.find((c: CollegeItem) => c.name.toLowerCase() === customerUser.college?.toLowerCase());
        return matched || { id: 'col-user', name: customerUser.college!, code: customerUser.college!, pickupPoint: 'CakeCampus Point', isActive: true };
      });
    }
  }, [customerUser?.college, colleges]);

  // Sync user-scoped cart to local storage
  useEffect(() => {
    try {
      const key = getUserCartStorageKey(customerUser);
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart, customerUser?.id, customerUser?.email]);

  useEffect(() => {
    try {
      if (lastCreatedOrder) {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(lastCreatedOrder));
      }
    } catch (e) {
      console.warn('Failed to save order to localStorage', e);
    }
  }, [lastCreatedOrder]);

  useEffect(() => {
    try {
      if (adminToken) {
        localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to save admin token to localStorage', e);
    }
  }, [adminToken]);

  useEffect(() => {
    try {
      if (customerToken) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, customerToken);
      } else {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to save customer token to localStorage', e);
    }
  }, [customerToken]);

  // Fetch cakes catalog from API
  const fetchCakes = async (includeHidden = false) => {
    setIsLoadingCakes(true);
    try {
      const res = await fetch(`${API_BASE}/api/cakes${includeHidden ? '?all=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCakes(data);
          if (!selectedCake) {
            setSelectedCake(data[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch cakes from API, using defaults:', err);
    } finally {
      setIsLoadingCakes(false);
    }
  };

  // Fetch colleges list from API
  const fetchColleges = async () => {
    setIsLoadingColleges(true);
    try {
      const res = await fetch(`${API_BASE}/api/colleges`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.colleges)) {
          setColleges(data.colleges);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch colleges from API:', err);
    } finally {
      setIsLoadingColleges(false);
    }
  };

  const selectCollege = async (collegeNameOrObj: string | CollegeItem): Promise<{ success: boolean; error?: string }> => {
    let collegeObj: CollegeItem;
    if (typeof collegeNameOrObj === 'string') {
      const found = colleges.find((c: CollegeItem) => c.name.toLowerCase() === collegeNameOrObj.toLowerCase());
      collegeObj = found || {
        id: `col-${Date.now()}`,
        name: collegeNameOrObj.trim(),
        code: collegeNameOrObj.trim(),
        pickupPoint: 'CakeCampus Point',
        isActive: true
      };
    } else {
      collegeObj = collegeNameOrObj;
    }

    setSelectedCollegeState(collegeObj);

    // If customer is logged in, sync to backend profile
    if (customerToken) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/select-college`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customerToken}`
          },
          body: JSON.stringify({ college: collegeObj.name })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCustomerUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Failed to sync selected college to profile:', err);
      }
    }

    return { success: true };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCakes();
    fetchColleges();
  }, []);

  // Check admin session on load
  const checkAdminAuth = async (): Promise<boolean> => {
    const token = adminToken || localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setAdminUser(null);
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.admin);
        return true;
      } else {
        setAdminToken(null);
        setAdminUser(null);
        return false;
      }
    } catch {
      return false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkAdminAuth();
  }, [adminToken]);

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      setAdminToken(data.token);
      setAdminUser(data.admin);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST' });
    } catch (err) {
      console.warn('Logout network error:', err);
    }
    setAdminToken(null);
    setAdminUser(null);
  };

  // Customer Auth Functions
  const fetchCustomerOrders = async () => {
    if (!customerToken) {
      setCustomerOrders([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/customer/orders`, {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Fetch customer orders error:', err);
    }
  };

  const checkCustomerAuth = async (): Promise<boolean> => {
    const token = customerToken || localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (!token) {
      setCustomerUser(null);
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerUser(data.user);
        setCustomerToken(token);
        return true;
      } else {
        setCustomerToken(null);
        setCustomerUser(null);
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        return false;
      }
    } catch {
      return false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkCustomerAuth();
  }, [customerToken]);

  // Auto-restore Firebase Google session on reload
  useEffect(() => {
    if (!firebaseAuth) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser && !customerToken) {
        // Firebase has a session but backend doesn't — sync it
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Student',
            googleId: firebaseUser.uid,
            avatarUrl: firebaseUser.photoURL || '',
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCustomerToken(data.token);
          setCustomerUser(data.user);
        }
      }
    });
    return () => unsubscribe();
  }, [customerToken]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (customerUser && customerToken) {
      fetchCustomerOrders();
    }
  }, [customerUser, customerToken]);

  const loginCustomer = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const loginWithGoogle = async (data: {
    name: string;
    email: string;
    googleId?: string;
    avatarUrl?: string;
    password?: string;
    phone?: string;
    rollNumber?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Google login failed.' };
      }
      setCustomerToken(resData.token);
      setCustomerUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const registerCustomer = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    rollNumber?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }
      setCustomerToken(resData.token);
      setCustomerUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const logoutCustomer = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      if (firebaseAuth) {
        await firebaseSignOut(firebaseAuth);
      }
    } catch (err) {
      console.warn('Logout network error:', err);
    }
    setCustomerToken(null);
    setCustomerUser(null);
    setCustomerOrders([]);
    setCart([]);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  };

  const updateCustomerProfile = async (updates: {
    name?: string;
    phone?: string;
    rollNumber?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!customerToken) return { success: false, error: 'Not logged in.' };
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }
      setCustomerUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  // Helper to compare arrays of strings
  const areArraysEqual = (a?: string[], b?: string[]) => {
    const arrA = a || [];
    const arrB = b || [];
    if (arrA.length !== arrB.length) return false;
    const sortedA = [...arrA].sort();
    const sortedB = [...arrB].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // Add to cart with business rules:
  // 1. Max 3 distinct line items
  // 2. Deduplication: if same cake + same options, increase qty instead of adding new line item
  const addToCart = (newItem: Omit<CartItem, 'id' | 'lineTotal'>): { success: boolean; message?: string } => {
    const existingIndex = cart.findIndex((item: CartItem) => 
      item.cakeId === newItem.cakeId &&
      item.weightKey === newItem.weightKey &&
      item.flavourKey === newItem.flavourKey &&
      areArraysEqual(item.toppingKeys, newItem.toppingKeys) &&
      areArraysEqual(item.addOnKeys, newItem.addOnKeys)
    );

    if (existingIndex !== -1) {
      // Merge into existing line item
      setCart((prev: CartItem[]) => {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.qty + newItem.qty;
        updated[existingIndex] = {
          ...current,
          qty: newQty,
          lineTotal: current.unitPrice * newQty,
        };
        return updated;
      });
      return { success: true, message: `Increased quantity to ${cart[existingIndex].qty + newItem.qty}` };
    }

    // New distinct line item check
    if (cart.length >= 3) {
      return { 
        success: false, 
        message: 'Cart limit reached: Maximum 3 distinct cake items allowed per pre-order.' 
      };
    }

    const fullCartItem: CartItem = {
      ...newItem,
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lineTotal: newItem.unitPrice * newItem.qty,
    };

    setCart((prev: CartItem[]) => [...prev, fullCartItem]);
    return { success: true };
  };

  const updateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev: CartItem[]) => prev.map((item: CartItem) => {
      if (item.id === id) {
        return {
          ...item,
          qty: newQty,
          lineTotal: item.unitPrice * newQty
        };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    try {
      const key = getUserCartStorageKey(customerUser);
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  // Pricing calculations
  const [configuredDeliveryCharge, setConfiguredDeliveryCharge] = useState(50);
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => res.ok ? res.json() : null)
      .then(config => {
        if (typeof config?.deliveryCharge === 'number') setConfiguredDeliveryCharge(config.deliveryCharge);
      })
      .catch(() => undefined);
  }, []);

  const itemsTotal = cart.reduce((sum: number, item: CartItem) => sum + item.lineTotal, 0);
  const deliveryCharge = cart.length > 0 ? configuredDeliveryCharge : 0;
  const grandTotal = itemsTotal + deliveryCharge;

  const formatPrice = (amount: number): string => {
    return `₹${Math.round(amount)}`;
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedCake,
        setSelectedCake,
        cakes,
        isLoadingCakes,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        fetchCakes,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        itemsTotal,
        deliveryCharge,
        grandTotal,
        lastCreatedOrder,
        setLastCreatedOrder,
        trackingOrderId,
        setTrackingOrderId,
        trackingPhoneOrEmail,
        setTrackingPhoneOrEmail,
        adminToken,
        adminUser,
        loginAdmin,
        logoutAdmin,
        checkAdminAuth,
        customerToken,
        customerUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        loginCustomer,
        loginWithGoogle,
        registerCustomer,
        logoutCustomer,
        updateCustomerProfile,
        customerOrders,
        fetchCustomerOrders,
        colleges,
        isLoadingColleges,
        selectedCollege,
        fetchColleges,
        selectCollege,
        formatPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
