import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  PartyPopper, 
  XCircle,
  AlertCircle,
  Filter,
  Loader2,
  LogOut,
  Calendar,
  Cake,
  Cookie,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  X,
  Image as ImageIcon,
  PlusCircle,
  Store,
  ArrowLeft,
  Upload,
  ImagePlus,
  ArrowUp,
  Building2,
  MapPin,
  QrCode,
  Mail
} from 'lucide-react';
import { CanonicalOrderStatus, OrderData, CakeItem } from '../../types';

// Helper to compress and convert device file into a crisp Base64 Data URL
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ALL_STATUSES: { key: CanonicalOrderStatus; label: string; badgeClass: string }[] = [
  { key: 'PAYMENT_PENDING', label: 'Payment Pending', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'PAYMENT_SUBMITTED', label: 'Payment Submitted', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { key: 'PAID_VERIFIED', label: 'Paid Verified', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'PAYMENT_REJECTED', label: 'Payment Rejected', badgeClass: 'bg-red-50 text-red-800 border-red-200' },
  { key: 'PREPARING', label: 'Preparing', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  { key: 'COMPLETED', label: 'Completed', badgeClass: 'bg-zinc-100 text-[#1A0A04] border-zinc-300' },
  { key: 'CANCELLED', label: 'Cancelled', badgeClass: 'bg-[#5C2D14]/10 text-[#7C5542] border-[#5C2D14]/25' },
];

export const AdminScreen: React.FC = () => {
  const { 
    adminToken, 
    adminUser, 
    loginAdmin, 
    logoutAdmin, 
    cakes, 
    fetchCakes, 
    colleges, 
    fetchColleges, 
    setCurrentScreen 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'cakes' | 'colleges' | 'payments'>('orders');

  // Payments & QR configuration states
  const [campusUpiId, setCampusUpiId] = useState('cakecampus@okhdfcbank');
  const [campusUpiPayeeName, setCampusUpiPayeeName] = useState('CakeCampus');
  const [customUpiQrUrl, setCustomUpiQrUrl] = useState('');
  const [dynamicQrPreview, setDynamicQrPreview] = useState('');
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);
  const qrUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Email dispatch states
  const [sendingEmailOrderId, setSendingEmailOrderId] = useState<string | null>(null);
  const [sentEmailOrdersMap, setSentEmailOrdersMap] = useState<Record<string, boolean>>({});

  // College management states
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newCollegeLocation, setNewCollegeLocation] = useState('');
  const [newCollegePickupPoint, setNewCollegePickupPoint] = useState('');
  const [isAddingCollege, setIsAddingCollege] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

  // Login form states
  const [emailInput, setEmailInput] = useState('admin@cakecampus.edu');
  const [passwordInput, setPasswordInput] = useState('Admin@123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings state
  const [deliveryCharge, setDeliveryCharge] = useState<number>(50);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Add/Edit Item Modal State
  const [isAddCakeOpen, setIsAddCakeOpen] = useState(false);
  const [newCakeItemType, setNewCakeItemType] = useState<'cake' | 'biscuit'>('cake');
  const [newCakeName, setNewCakeName] = useState('');
  const [newCakeDescription, setNewCakeDescription] = useState('');
  const [newCakeBasePrice, setNewCakeBasePrice] = useState(470);
  const [newCakeCategory, setNewCakeCategory] = useState('Fruit Pastries');
  const [newCakeImages, setNewCakeImages] = useState<string[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'cake' | 'biscuit'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Editing state for Full Item Editor
  const [editingCake, setEditingCake] = useState<CakeItem | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDeviceUpload = async (files: FileList | null, isEditMode: boolean) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const dataUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await processImageFile(file);
          dataUrls.push(dataUrl);
        }
      }
      if (isEditMode) {
        setEditingCake(prev => prev ? ({
          ...prev,
          images: [...prev.images, ...dataUrls]
        }) : null);
      } else {
        setNewCakeImages(prev => [...prev, ...dataUrls]);
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process image file. Please try another image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const fetchOrders = async () => {
    if (!adminToken) return;
    setIsLoadingOrders(true);
    try {
      let url = `${API_BASE}/api/admin/orders?`;
      if (filterStatus && filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (filterDate) url += `pickupDate=${filterDate}&`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          logoutAdmin();
        }
        throw new Error('Failed to load orders.');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.warn('Orders fetch error:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchSettings = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const deliverySetting = data.find((s: any) => s.key === 'delivery_charge');
        if (deliverySetting) {
          setDeliveryCharge(Number(deliverySetting.value));
        }
      }
    } catch (err) {
      console.warn('Settings fetch error:', err);
    }
  };

  const fetchPaymentConfig = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/payments/config`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampusUpiId(data.campusUpiId || 'cakecampus@okhdfcbank');
        setCampusUpiPayeeName(data.campusUpiPayeeName || 'CakeCampus');
        setCustomUpiQrUrl(data.customUpiQrUrl || '');
        setDynamicQrPreview(data.dynamicQrPreview || '');
      }
    } catch (err) {
      console.warn('Payment config fetch error:', err);
    }
  };

  const handleQrDeviceUpload = async (file: File) => {
    if (!file || !adminToken) return;
    setIsUploadingQr(true);
    try {
      const base64 = await processImageFile(file);
      const res = await fetch(`${API_BASE}/api/admin/payments/qr-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ imageData: base64 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomUpiQrUrl(data.qrUrl);
        setStatusNotification('Custom UPI QR code uploaded & updated successfully! 🎉');
        setTimeout(() => setStatusNotification(null), 3500);
      } else {
        alert(data.error || 'Failed to upload QR code.');
      }
    } catch (err: any) {
      console.error('QR upload error:', err);
      alert('Error uploading QR code: ' + err.message);
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleResetCustomQr = async () => {
    if (!adminToken) return;
    if (!confirm('Are you sure you want to revert to the dynamically generated UPI QR code?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/payments/qr-custom`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setCustomUpiQrUrl('');
        setStatusNotification('Reverted to dynamically generated UPI QR code.');
        setTimeout(() => setStatusNotification(null), 3000);
      }
    } catch (err: any) {
      console.error('Reset QR error:', err);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setIsSavingPaymentSettings(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/payments/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          campusUpiId: campusUpiId.trim(),
          campusUpiPayeeName: campusUpiPayeeName.trim(),
          customUpiQrUrl: customUpiQrUrl.trim()
        })
      });
      if (res.ok) {
        setStatusNotification('UPI payment details saved successfully!');
        setTimeout(() => setStatusNotification(null), 3000);
        fetchPaymentConfig();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save payment settings.');
      }
    } catch (err: any) {
      console.error('Save payment settings error:', err);
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleSendConfirmationEmail = async (orderId: string, customerEmail: string) => {
    if (!adminToken) return;
    setSendingEmailOrderId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSentEmailOrdersMap(prev => ({ ...prev, [orderId]: true }));
        setStatusNotification(`Order confirmation email sent to ${customerEmail}! ✉️`);
        setTimeout(() => setStatusNotification(null), 4000);
      } else {
        alert(data.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      alert('Network error while dispatching email.');
    } finally {
      setSendingEmailOrderId(null);
    }
  };

  useEffect(() => {
    if (adminToken && adminUser) {
      fetchOrders();
      fetchSettings();
      fetchPaymentConfig();
    }
  }, [adminToken, adminUser, filterStatus, filterDate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    const res = await loginAdmin(emailInput.trim(), passwordInput);
    if (!res.success) {
      setLoginError(res.error || 'Invalid admin email or password.');
    }
    setIsLoggingIn(false);
  };

  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: CanonicalOrderStatus) => {
    if (!adminToken) return;

    // Optimistically update local UI state immediately
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status: newStatus } : o)));

    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => (o.orderId === orderId ? updated.order : o)));
        setStatusNotification(`Order #${orderId} status updated to ${newStatus}`);
        setTimeout(() => setStatusNotification(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to update status: ${errData.error || 'Server error'}`);
        fetchOrders(); // Revert back on error
      }
    } catch (err) {
      console.error('Update status error:', err);
      fetchOrders();
    }
  };

  const handleVerifyPayment = async (orderId: string, decision: 'VERIFY' | 'REJECT', rejectionReason?: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ decision, rejectionReason })
      });
      if (res.ok) {
        setStatusNotification(`Payment for Order #${orderId} ${decision === 'VERIFY' ? 'verified' : 'rejected'}`);
        setTimeout(() => setStatusNotification(null), 3000);
        fetchOrders();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to update payment: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Verify payment error:', err);
    }
  };

  const handleUpdateDeliveryCharge = async () => {
    if (!adminToken) return;
    setIsUpdatingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/delivery-charge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ value: deliveryCharge })
      });
      if (res.ok) {
        setStatusNotification('Delivery charge updated successfully!');
        setTimeout(() => setStatusNotification(null), 3000);
      } else {
        alert('Failed to update delivery charge.');
      }
    } catch (err) {
      console.error('Update delivery charge error:', err);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newCollegeName.trim()) return;
    setIsAddingCollege(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/colleges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: newCollegeName.trim(),
          code: (newCollegeCode.trim() || newCollegeName.trim()).toUpperCase(),
          location: newCollegeLocation.trim(),
          pickupPoint: newCollegePickupPoint.trim() || 'CakeCampus Point'
        })
      });
      if (res.ok) {
        setStatusNotification(`Campus "${newCollegeName}" added successfully!`);
        setTimeout(() => setStatusNotification(null), 3000);
        setNewCollegeName('');
        setNewCollegeCode('');
        setNewCollegeLocation('');
        setNewCollegePickupPoint('');
        fetchColleges();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to add college.');
      }
    } catch (err) {
      console.error('Add college error:', err);
    } finally {
      setIsAddingCollege(false);
    }
  };

  const handleDeleteCollege = async (id: string, name: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Are you sure you want to delete campus "${name}" from the system?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/colleges/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        setStatusNotification(`College "${name}" deleted.`);
        setTimeout(() => setStatusNotification(null), 3000);
        fetchColleges();
      } else {
        alert('Failed to delete college.');
      }
    } catch (err) {
      console.error('Delete college error:', err);
    }
  };

  const handleStatusUpdate = handleStatusChange;

  const handleToggleAvailability = async (cakeId: string, currentStatus: boolean) => {
    if (!adminToken) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/cakes/${cakeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (res.ok) {
        fetchCakes();
      }
    } catch (err) {
      console.error('Toggle cake error:', err);
    }
  };

  const handleCreateCake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newCakeName.trim()) return;

    const isBiscuit = newCakeItemType === 'biscuit';
    const weights = isBiscuit
      ? [
          { key: '250g Pack', price: Math.round(newCakeBasePrice * 0.35) },
          { key: '500g Pack', price: Math.round(newCakeBasePrice * 0.6) },
          { key: '1kg Box', price: newCakeBasePrice }
        ]
      : [
          { key: '0.5kg', price: Math.round(newCakeBasePrice * 0.58) },
          { key: '1kg', price: newCakeBasePrice },
          { key: '2kg', price: Math.round(newCakeBasePrice * 1.9) }
        ];

    try {
      const res = await fetch(`${API_BASE}/api/admin/cakes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: newCakeName.trim(),
          description: newCakeDescription.trim() || (isBiscuit ? 'Fresh handcrafted bakery cookies' : 'Delicious artisanal cake'),
          category: newCakeCategory,
          itemType: newCakeItemType,
          images: newCakeImages.length > 0
            ? newCakeImages
            : isBiscuit 
            ? ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80']
            : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'],
          weights,
          flavours: isBiscuit 
            ? [
                { key: 'Original Classic', extra: 0 },
                { key: 'Chocolate Infusion', extra: 15 }
              ]
            : [
                { key: 'Classic Flavour', extra: 0 },
                { key: 'Chocolate', extra: 20 }
              ],
          toppings: [
            { key: 'Choco chips', extra: 10 },
            { key: 'Almond Flakes', extra: 15 }
          ],
          addOns: isBiscuit
            ? [
                { key: 'Gift Packaging Box', extra: 25 },
                { key: 'Celebration Card', extra: 15 }
              ]
            : [
                { key: 'Candles', extra: 10 },
                { key: 'Knife', extra: 10 },
                { key: 'Sparkler Candle', extra: 25 }
              ],
          isAvailable: true
        })
      });

      if (res.ok) {
        setIsAddCakeOpen(false);
        setNewCakeName('');
        setNewCakeDescription('');
        fetchCakes();
      }
    } catch (err) {
      console.error('Create item error:', err);
    }
  };

  const handleOpenEdit = (cake: CakeItem) => {
    // Clone cake object deeply so edits do not mutate list until saved
    setEditingCake(JSON.parse(JSON.stringify(cake)));
    setNewImageUrl('');
    setEditSuccessMsg(null);
  };

  const handleSaveEditedCake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !editingCake) return;

    const id = editingCake.id || editingCake._id;
    if (!id) return;

    setIsSavingItem(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/cakes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: editingCake.name.trim(),
          description: editingCake.description.trim(),
          category: editingCake.category,
          itemType: editingCake.itemType || 'cake',
          images: editingCake.images,
          weights: editingCake.weights,
          flavours: editingCake.flavours,
          toppings: editingCake.toppings,
          addOns: editingCake.addOns,
          isAvailable: editingCake.isAvailable
        })
      });

      if (res.ok) {
        setEditSuccessMsg('Item changes saved successfully! Live menu updated.');
        await fetchCakes();
        setTimeout(() => {
          setEditingCake(null);
          setEditSuccessMsg(null);
        }, 1200);
      } else {
        alert('Failed to save item changes.');
      }
    } catch (err) {
      console.error('Save cake edit error:', err);
      alert('Error updating item.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (cakeId: string, cakeName: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Are you sure you want to completely remove "${cakeName}" from the menu?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/cakes/${cakeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (res.ok) {
        if (editingCake && (editingCake.id === cakeId || editingCake._id === cakeId)) {
          setEditingCake(null);
        }
        fetchCakes();
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  // Login Screen if not authenticated
  if (!adminUser || !adminToken) {
    return (
      <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentScreen('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C5542] hover:text-[#5C2D14] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Customer Store</span>
          </button>

          <span className="text-[11px] bg-[#5C2D14]/15 text-[#7C5542] font-bold px-2.5 py-1 rounded-full">
            Admin Auth
          </span>
        </div>

        <div className="bg-[#FFF8EE] p-6 sm:p-8 rounded-3xl border border-[#F3EAE3] shadow-lg space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#5C2D14]/10 text-[#5C2D14] flex items-center justify-center mx-auto border border-[#5C2D14]/25 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#1A0A04] font-serif">CakeCampus Admin Portal</h1>
            <p className="text-xs text-[#7C5542] mt-1">
              Management workspace for bakery menu, pricing tiers & student pre-orders
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-[#5C2D14]/10 border border-[#5C2D14]/25 text-[#1A0A04] text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7C5542]">Admin Email</label>
              <input
                type="email"
                placeholder="admin@cakecampus.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7C5542]">Admin Password</label>
              <input
                type="password"
                placeholder="Default: Admin@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] text-white font-bold text-xs shadow-md shadow-[#5C2D14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Log In to Admin Dashboard</span>
            </button>

            <p className="text-[11px] text-[#7C5542]/70 text-center pt-1">
              Default credentials: <code className="bg-zinc-100 px-1 py-0.5 rounded text-[#7C5542] font-mono">admin@cakecampus.edu</code> / <code className="bg-zinc-100 px-1 py-0.5 rounded text-[#7C5542] font-mono">Admin@123</code>
            </p>
          </form>
        </div>

        <div className="text-center pt-8 text-xs text-[#7C5542]/70">
          CakeCampus Operations Panel • Fixed Pickup Management
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Standalone Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFF8EE]/95 backdrop-blur-md border-b border-[#F3EAE3] px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center shadow-md shadow-[#5C2D14]/20 font-serif font-black">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg text-[#1A0A04]">
                  CakeCampus Admin
                </span>
                <span className="text-[10px] bg-[#5C2D14]/10 text-[#3B1C0D] font-bold px-2 py-0.5 rounded-full border border-[#5C2D14]/25">
                  Operations
                </span>
              </div>
              <p className="text-[11px] text-[#7C5542]">
                Logged in as <strong>{adminUser.name}</strong> ({adminUser.email})
              </p>
            </div>
          </div>

          {/* Center / Right: Tab Navigation & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs */}
            <div className="bg-[#F5EDE4] p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-[#5C2D14]/20">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'orders' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('cakes')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'cakes' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                Bakery Catalog ({cakes.length})
              </button>
              <button
                onClick={() => setActiveTab('colleges')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'colleges' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                Campuses ({colleges.length})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'payments' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-[#5C2D14]" />
                <span>Payments & QR</span>
              </button>
            </div>

            {/* Link to Customer Store */}
            <button
              onClick={() => setCurrentScreen('home')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFF8EE] hover:bg-zinc-50 border border-[#5C2D14]/20 text-xs font-semibold text-[#7C5542] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Open Customer Store"
            >
              <Store className="w-3.5 h-3.5 text-[#5C2D14]" />
              <span>Customer Store ↗</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => {
                fetchOrders();
                fetchCakes();
              }}
              disabled={isLoadingOrders}
              className="p-2 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/20 text-[#7C5542] hover:bg-zinc-50 shadow-2xs cursor-pointer transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout button */}
            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-[#5C2D14]/10 text-[#3B1C0D] hover:bg-[#5C2D14]/15 border border-[#5C2D14]/25 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-32 flex-1 space-y-6">

      {statusNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {activeTab === 'orders' ? (
        /* --- ORDERS MANAGEMENT TAB --- */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#7C5542]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, student, roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04] shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs font-bold text-[#7C5542] shadow-2xs"
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              {ALL_STATUSES.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs font-bold text-[#7C5542] shadow-2xs"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#5C2D14] font-bold hover:underline"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#FFF8EE] rounded-3xl border border-[#F3EAE3] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F5EDE4] border-b border-[#5C2D14]/20 text-[#7C5542] font-bold">
                  <tr>
                    <th className="p-3.5 pl-5">Order ID</th>
                    <th className="p-3.5">Student / Roll</th>
                    <th className="p-3.5">Pickup Date</th>
                    <th className="p-3.5">Items Summary</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status & Action</th>
                    <th className="p-3.5">Email Confirmation</th>
                    <th className="p-3.5 pr-5">Notion Mirror</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-[#7C5542]/70">
                        No orders matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const statusInfo = ALL_STATUSES.find(s => s.key === order.status) || ALL_STATUSES[0];
                      const pickupDateStr = typeof order.pickupDate === 'string'
                        ? order.pickupDate.split('T')[0]
                        : new Date(order.pickupDate).toISOString().split('T')[0];

                      const isCompletedOrVerified = order.status === 'COMPLETED' || order.status === 'PAID_VERIFIED';

                      return (
                        <tr key={order.orderId} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="p-3.5 pl-5 font-mono font-bold text-[#5C2D14]">
                            {order.orderId}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-[#1A0A04]">{order.customer.name}</div>
                            <div className="text-[11px] text-[#7C5542] font-mono">{order.customer.rollNumber} • {order.customer.phone}</div>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-semibold text-[#1A0A04]">{pickupDateStr}</div>
                            <div className="text-[10px] text-[#7C5542]/70">{order.pickupPoint || 'CakeCampus Point'}</div>
                          </td>
                          <td className="p-3.5 max-w-xs truncate">
                            <div className="text-[#1A0A04] font-medium truncate">
                              {order.items.map(i => `${i.qty}x ${i.cakeNameSnapshot} (${i.weightKey}, ${i.flavourKey})`).join(', ')}
                            </div>
                            {order.cakeMessage && (
                              <div className="text-[10px] text-[#5C2D14] truncate">
                                Msg: "{order.cakeMessage}"
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-[#1A0A04]">₹{order.totalAmount}</div>
                            <div className="text-[10px] text-[#7C5542]/70 mt-1">
                              {order.payment?.utr ? (
                                <div className="text-blue-600 font-bold">UTR: {order.payment.utr}</div>
                              ) : (
                                <div className="text-[#7C5542] uppercase">{order.payment?.method || 'N/A'}</div>
                              )}
                              {order.payment?.verificationStatus && (
                                <div className="text-[#7C5542] mt-0.5">Status: {order.payment.verificationStatus}</div>
                              )}
                              {order.payment?.screenshotUrl && (
                                <a href={order.payment.screenshotUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={order.payment.screenshotUrl} alt="Payment" className="w-10 h-10 object-cover mt-1 rounded border border-[#5C2D14]/20" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value as CanonicalOrderStatus)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.badgeClass} focus:outline-hidden cursor-pointer`}
                            >
                              {ALL_STATUSES.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                              ))}
                            </select>
                            {order.status === 'PAYMENT_SUBMITTED' && (
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => handleVerifyPayment(order.orderId, 'VERIFY')}
                                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold cursor-pointer"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = window.prompt("Enter rejection reason:");
                                    if (reason !== null) {
                                      handleVerifyPayment(order.orderId, 'REJECT', reason);
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isCompletedOrVerified ? (
                              <button
                                onClick={() => handleSendConfirmationEmail(order.orderId, order.customer.email)}
                                disabled={sendingEmailOrderId === order.orderId}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                                title={`Send full order details email to ${order.customer.email}`}
                              >
                                {sendingEmailOrderId === order.orderId ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : sentEmailOrdersMap[order.orderId] ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                                    <span>Sent ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    <span>Send Email</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#7C5542]/70 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>Verify First</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 pr-5">
                            {order.notion?.pageUrl ? (
                              <a
                                href={order.notion.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#5C2D14] hover:underline font-semibold"
                              >
                                <span>Notion</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-[#7C5542]/70">Synced</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Settings Section */}
          <div className="bg-[#FFF8EE] p-5 rounded-3xl border border-[#F3EAE3] shadow-xs mt-6">
            <h3 className="text-sm font-bold text-[#1A0A04] mb-3">Settings</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="text-xs font-semibold text-[#7C5542]">Delivery Charge (₹)</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className="w-full sm:w-32 px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs font-bold"
              />
              <button
                onClick={handleUpdateDeliveryCharge}
                disabled={isUpdatingSettings}
                className="w-full sm:w-auto px-4 py-2 bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/60 text-white rounded-xl text-xs font-bold shadow-md shadow-[#5C2D14]/20 cursor-pointer"
              >
                {isUpdatingSettings ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'cakes' ? (
        /* --- BAKERY CATALOG MANAGEMENT TAB --- */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1A0A04]">Bakery Catalog & Pricing Management</h2>
              <p className="text-xs text-[#7C5542]">Full manual control over cakes & biscuits, images, names, pricing tiers, and descriptions</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddCakeOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] text-white font-bold text-xs shadow-md shadow-[#5C2D14]/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFF8EE] p-3 rounded-2xl border border-[#F3EAE3]">
            {/* Section filter pills */}
            <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold w-full sm:w-auto">
              <button
                onClick={() => setCatalogFilter('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
                  catalogFilter === 'all' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                All Items ({cakes.length})
              </button>
              <button
                onClick={() => setCatalogFilter('cake')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  catalogFilter === 'cake' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                <Cake className="w-3.5 h-3.5" />
                Cakes ({cakes.filter(c => (c.itemType || 'cake') === 'cake').length})
              </button>
              <button
                onClick={() => setCatalogFilter('biscuit')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  catalogFilter === 'biscuit' ? 'bg-[#FFF8EE] text-[#5C2D14] shadow-xs' : 'text-[#7C5542] hover:text-[#1A0A04]'
                }`}
              >
                <Cookie className="w-3.5 h-3.5" />
                Biscuits ({cakes.filter(c => c.itemType === 'biscuit').length})
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#7C5542]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items by name..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs focus:outline-hidden focus:border-[#5C2D14]"
              />
            </div>
          </div>

          {/* Quick Add Item Modal */}
          {isAddCakeOpen && (
            <form onSubmit={handleCreateCake} className="bg-[#FFF8EE] p-6 rounded-3xl border-2 border-[#5C2D14]/30 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5C2D14]" />
                  <h3 className="text-sm font-black text-[#1A0A04]">Add New Item to Bakery Menu</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCakeOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-[#7C5542] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7C5542]">Item Type</label>
                  <select
                    value={newCakeItemType}
                    onChange={(e) => setNewCakeItemType(e.target.value as 'cake' | 'biscuit')}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs font-bold"
                  >
                    <option value="cake">🎂 Cake</option>
                    <option value="biscuit">🍪 Biscuit / Cookie</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C5542]">Item Name</label>
                  <input
                    type="text"
                    placeholder={newCakeItemType === 'cake' ? 'e.g. Belgian Truffle Noir' : 'e.g. Butter Shortbread'}
                    value={newCakeName}
                    onChange={(e) => setNewCakeName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C5542]">Base Price (1kg)</label>
                  <input
                    type="number"
                    value={newCakeBasePrice}
                    onChange={(e) => setNewCakeBasePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C5542]">Category</label>
                  <select
                    value={newCakeCategory}
                    onChange={(e) => setNewCakeCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs font-bold"
                  >
                    {newCakeItemType === 'cake' ? (
                      <>
                        <option value="Fruit Pastries">Fruit Pastries</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Classic">Classic</option>
                        <option value="Premium">Premium</option>
                        <option value="Specialty">Specialty</option>
                      </>
                    ) : (
                      <>
                        <option value="Butter">Butter</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Nutty">Nutty</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Healthy">Healthy</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7C5542]">Description</label>
                <textarea
                  rows={2}
                  placeholder={newCakeItemType === 'cake' ? 'Rich sponge with luscious layers...' : 'Crispy golden baked cookies with pure butter...'}
                  value={newCakeDescription}
                  onChange={(e) => setNewCakeDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                />
              </div>

              {/* Photos & Device Upload for Add Item */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#7C5542]">Item Photos</label>
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-1.5 rounded-xl bg-[#5C2D14]/10 hover:bg-[#5C2D14]/15 text-[#3B1C0D] text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[#5C2D14]/25"
                  >
                    {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload from Device</span>
                  </button>
                  <input
                    type="file"
                    ref={addFileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleDeviceUpload(e.target.files, false)}
                    className="hidden"
                  />
                </div>

                {newCakeImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {newCakeImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-[#5C2D14]/20 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewCakeImages(newCakeImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#5C2D14]/15">
                <button
                  type="button"
                  onClick={() => setIsAddCakeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#5C2D14]/20 text-xs font-semibold text-[#7C5542] hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] text-white text-xs font-bold shadow-md shadow-[#5C2D14]/30 cursor-pointer"
                >
                  Save New Item
                </button>
              </div>
            </form>
          )}

          {/* FULL MANUAL ITEM EDITOR MODAL */}
          {editingCake && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-[#FFF8EE] rounded-3xl border border-[#5C2D14]/25 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-[#F3EAE3] flex items-center justify-between bg-[#F5EDE4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        editingCake.itemType === 'biscuit' ? 'bg-amber-100 text-amber-900' : 'bg-[#5C2D14]/15 text-[#1A0A04]'
                      }`}>
                        {editingCake.itemType === 'biscuit' ? '🍪 BISCUIT ITEM' : '🎂 CAKE ITEM'}
                      </span>
                      <span className="text-xs text-[#7C5542] font-mono">ID: {editingCake.id || editingCake._id}</span>
                    </div>
                    <h2 className="text-lg font-black text-[#1A0A04] font-serif mt-0.5">
                      Edit Item: {editingCake.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setEditingCake(null)}
                    className="w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#5C2D14]/20 hover:bg-zinc-100 flex items-center justify-center text-[#7C5542] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Form Body */}
                <form onSubmit={handleSaveEditedCake} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Success Toast */}
                  {editSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{editSuccessMsg}</span>
                    </div>
                  )}

                  {/* 1. General Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide border-b border-[#5C2D14]/15 pb-1">
                      1. General Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#7C5542]">Item Name</label>
                        <input
                          type="text"
                          value={editingCake.name}
                          onChange={(e) => setEditingCake({ ...editingCake, name: e.target.value })}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#7C5542]">Item Type</label>
                        <select
                          value={editingCake.itemType || 'cake'}
                          onChange={(e) => setEditingCake({ ...editingCake, itemType: e.target.value as 'cake' | 'biscuit' })}
                          className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs font-bold"
                        >
                          <option value="cake">🎂 Cake</option>
                          <option value="biscuit">🍪 Biscuit / Cookie</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#7C5542]">Category</label>
                        <input
                          type="text"
                          value={editingCake.category || ''}
                          onChange={(e) => setEditingCake({ ...editingCake, category: e.target.value })}
                          placeholder="e.g. Fruit Pastries, Chocolate"
                          className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#7C5542]">Description</label>
                      <textarea
                        rows={3}
                        value={editingCake.description}
                        onChange={(e) => setEditingCake({ ...editingCake, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                      />
                    </div>
                  </div>

                  {/* 2. Images List & Device Uploader */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-1">
                      <div>
                        <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                          2. Photos & Device Upload
                        </h3>
                        <p className="text-[11px] text-[#7C5542]/70">Upload photos directly from your phone/computer or paste web URLs</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-3.5 py-1.5 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Upload from Device</span>
                      </button>
                      <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/*"
                        multiple
                        onChange={(e) => handleDeviceUpload(e.target.files, true)}
                        className="hidden"
                      />
                    </div>

                    {/* Image previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editingCake.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-[#5C2D14]/20 group shadow-xs">
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          
                          {/* Primary Cover Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 text-[9px] bg-[#5C2D14] text-[#1A0A04] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                              Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [imgUrl, ...editingCake.images.filter((_, i) => i !== idx)];
                                setEditingCake({ ...editingCake, images: newImages });
                              }}
                              className="absolute top-1.5 left-1.5 text-[9px] bg-black/70 hover:bg-[#5C2D14] text-[#1A0A04] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                              title="Make this the primary cover photo"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                              <span>Set Cover</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingCake.images.filter((_, i) => i !== idx);
                              setEditingCake({ 
                                ...editingCake, 
                                images: updated.length ? updated : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'] 
                              });
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Image URL Fallback */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        placeholder="Or paste an image web URL (https://...)..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newImageUrl.trim()) {
                            setEditingCake({
                              ...editingCake,
                              images: [...editingCake.images, newImageUrl.trim()]
                            });
                            setNewImageUrl('');
                          }
                        }}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* 3. Weight / Pack Tiers & Pricing */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-1">
                      <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                        3. Weights / Pack Sizes & Prices (₹)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCake({
                            ...editingCake,
                            weights: [...editingCake.weights, { key: '500g', price: 300 }]
                          });
                        }}
                        className="text-xs text-[#5C2D14] hover:text-[#3B1C0D] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Size Tier</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingCake.weights.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20">
                          <input
                            type="text"
                            placeholder="e.g. 0.5kg, 1kg, 250g Pack"
                            value={w.key}
                            onChange={(e) => {
                              const updated = [...editingCake.weights];
                              updated[idx].key = e.target.value;
                              setEditingCake({ ...editingCake, weights: updated });
                            }}
                            required
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-[#7C5542]">₹</span>
                            <input
                              type="number"
                              value={w.price}
                              onChange={(e) => {
                                const updated = [...editingCake.weights];
                                updated[idx].price = Number(e.target.value);
                                setEditingCake({ ...editingCake, weights: updated });
                              }}
                              required
                              className="w-24 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                            />
                          </div>
                          {editingCake.weights.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingCake.weights.filter((_, i) => i !== idx);
                                setEditingCake({ ...editingCake, weights: updated });
                              }}
                              className="w-7 h-7 rounded-lg text-[#5C2D14] hover:bg-[#5C2D14]/10 flex items-center justify-center cursor-pointer"
                              title="Delete size"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Flavours & Extra Charges */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-1">
                      <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                        4. Flavours / Varieties
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCake({
                            ...editingCake,
                            flavours: [...editingCake.flavours, { key: 'New Flavour', extra: 0 }]
                          });
                        }}
                        className="text-xs text-[#5C2D14] hover:text-[#3B1C0D] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Flavour</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingCake.flavours.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20">
                          <input
                            type="text"
                            placeholder="e.g. Chocolate, Vanilla"
                            value={f.key}
                            onChange={(e) => {
                              const updated = [...editingCake.flavours];
                              updated[idx].key = e.target.value;
                              setEditingCake({ ...editingCake, flavours: updated });
                            }}
                            required
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-[#7C5542]">+₹</span>
                            <input
                              type="number"
                              value={f.extra}
                              onChange={(e) => {
                                const updated = [...editingCake.flavours];
                                updated[idx].extra = Number(e.target.value);
                                setEditingCake({ ...editingCake, flavours: updated });
                              }}
                              required
                              className="w-20 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                            />
                          </div>
                          {editingCake.flavours.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingCake.flavours.filter((_, i) => i !== idx);
                                setEditingCake({ ...editingCake, flavours: updated });
                              }}
                              className="w-7 h-7 rounded-lg text-[#5C2D14] hover:bg-[#5C2D14]/10 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Toppings & Extra Charges */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-1">
                      <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                        5. Toppings & Garnishes
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCake({
                            ...editingCake,
                            toppings: [...editingCake.toppings, { key: 'New Topping', extra: 10 }]
                          });
                        }}
                        className="text-xs text-[#5C2D14] hover:text-[#3B1C0D] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Topping</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingCake.toppings.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20">
                          <input
                            type="text"
                            placeholder="e.g. Choco chips, Roasted Almonds"
                            value={t.key}
                            onChange={(e) => {
                              const updated = [...editingCake.toppings];
                              updated[idx].key = e.target.value;
                              setEditingCake({ ...editingCake, toppings: updated });
                            }}
                            required
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-[#7C5542]">+₹</span>
                            <input
                              type="number"
                              value={t.extra}
                              onChange={(e) => {
                                const updated = [...editingCake.toppings];
                                updated[idx].extra = Number(e.target.value);
                                setEditingCake({ ...editingCake, toppings: updated });
                              }}
                              required
                              className="w-20 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingCake.toppings.filter((_, i) => i !== idx);
                              setEditingCake({ ...editingCake, toppings: updated });
                            }}
                            className="w-7 h-7 rounded-lg text-[#5C2D14] hover:bg-[#5C2D14]/10 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Celebration / Gifting Add-ons */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-1">
                      <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                        6. Celebration & Gifting Add-ons
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCake({
                            ...editingCake,
                            addOns: [...editingCake.addOns, { key: 'Sparkler Candle', extra: 25 }]
                          });
                        }}
                        className="text-xs text-[#5C2D14] hover:text-[#3B1C0D] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Add-on</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingCake.addOns.map((a, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20">
                          <input
                            type="text"
                            placeholder="e.g. Candles, Knife, Gift Box"
                            value={a.key}
                            onChange={(e) => {
                              const updated = [...editingCake.addOns];
                              updated[idx].key = e.target.value;
                              setEditingCake({ ...editingCake, addOns: updated });
                            }}
                            required
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-[#7C5542]">+₹</span>
                            <input
                              type="number"
                              value={a.extra}
                              onChange={(e) => {
                                const updated = [...editingCake.addOns];
                                updated[idx].extra = Number(e.target.value);
                                setEditingCake({ ...editingCake, addOns: updated });
                              }}
                              required
                              className="w-20 px-3 py-1.5 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 text-xs font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingCake.addOns.filter((_, i) => i !== idx);
                              setEditingCake({ ...editingCake, addOns: updated });
                            }}
                            className="w-7 h-7 rounded-lg text-[#5C2D14] hover:bg-[#5C2D14]/10 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. Item Availability */}
                  <div className="bg-[#F5EDE4] p-4 rounded-2xl border border-[#5C2D14]/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A0A04]">Item Menu Visibility</h4>
                      <p className="text-[11px] text-[#7C5542]">
                        {editingCake.isAvailable ? 'Currently visible for student pre-orders' : 'Hidden from main customer portal'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingCake({ ...editingCake, isAvailable: !editingCake.isAvailable })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                        editingCake.isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-zinc-200 text-[#7C5542] border-zinc-300'
                      }`}
                    >
                      {editingCake.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{editingCake.isAvailable ? 'Visible (Active)' : 'Hidden (Inactive)'}</span>
                    </button>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F3EAE3]">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(editingCake.id || editingCake._id!, editingCake.name)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#5C2D14]/10 hover:bg-[#5C2D14]/15 text-[#3B1C0D] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#5C2D14]/25 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Item Permanently</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setEditingCake(null)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#5C2D14]/20 text-xs font-semibold text-[#7C5542] hover:bg-zinc-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingItem}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/60 text-white font-bold text-xs shadow-lg shadow-[#5C2D14]/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSavingItem ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Live...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Save & Sync Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bakery Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cakes
              .filter(cake => {
                if (catalogFilter === 'cake' && (cake.itemType || 'cake') !== 'cake') return false;
                if (catalogFilter === 'biscuit' && cake.itemType !== 'biscuit') return false;
                if (catalogSearch.trim()) {
                  const q = catalogSearch.toLowerCase();
                  return cake.name.toLowerCase().includes(q) || cake.description.toLowerCase().includes(q) || (cake.category || '').toLowerCase().includes(q);
                }
                return true;
              })
              .map(cake => {
                const isCake = (cake.itemType || 'cake') === 'cake';
                return (
                  <div key={cake.id || cake._id} className="bg-[#FFF8EE] p-4 rounded-2xl border border-[#F3EAE3] shadow-xs space-y-3 hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={cake.images[0]}
                          alt={cake.name}
                          className="w-16 h-16 rounded-xl object-cover bg-zinc-100 shrink-0 border border-[#5C2D14]/15"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              isCake ? 'bg-[#5C2D14]/10 text-[#3B1C0D]' : 'bg-amber-50 text-amber-800'
                            }`}>
                              {isCake ? '🎂 Cake' : '🍪 Biscuit'}
                            </span>
                            <span className="text-[10px] bg-zinc-100 text-[#7C5542] font-semibold px-1.5 py-0.5 rounded-md truncate">
                              {cake.category || 'General'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[#1A0A04] truncate">{cake.name}</h3>
                          <p className="text-[11px] text-[#7C5542] line-clamp-1">{cake.description}</p>
                        </div>
                      </div>

                      {/* Weight tiers summary */}
                      <div className="bg-[#F5EDE4] px-2.5 py-1.5 rounded-xl text-[11px] text-[#7C5542] flex items-center justify-between">
                        <span className="font-semibold">{cake.weights.length} Tiers:</span>
                        <span className="font-bold text-[#5C2D14]">
                          {cake.weights.map(w => `${w.key} (₹${w.price})`).join(' • ')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#5C2D14]/15 flex items-center justify-between gap-2 text-xs">
                      {/* Availability toggle button */}
                      <button
                        onClick={() => handleToggleAvailability(cake.id || cake._id!, cake.isAvailable)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                          cake.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-[#7C5542] border-[#5C2D14]/20 hover:bg-zinc-200'
                        }`}
                      >
                        {cake.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{cake.isAvailable ? 'Visible' : 'Hidden'}</span>
                      </button>

                      {/* Edit Button */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cake)}
                          className="px-3 py-1 rounded-lg bg-[#5C2D14] hover:bg-[#3B1C0D] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit Full Item</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(cake.id || cake._id!, cake.name)}
                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-[#5C2D14]/10 text-[#7C5542] hover:text-[#5C2D14] flex items-center justify-center cursor-pointer transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : activeTab === 'colleges' ? (
        /* --- CAMPUSES / COLLEGES MANAGEMENT TAB --- */
        <div className="space-y-6">
          {/* Top Info Bar */}
          <div className="bg-[#FFF8EE] p-5 rounded-3xl border border-[#F3EAE3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5C2D14]/10 text-[#5C2D14] flex items-center justify-center border border-[#5C2D14]/25 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A0A04]">Campus / College Management</h2>
                <p className="text-xs text-[#7C5542]">
                  Manage the official list of colleges and campus pickup points available for student selection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-100 text-[#7C5542]">
                Total Campuses: {colleges.length}
              </span>
            </div>
          </div>

          {/* Add New College Card */}
          <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F3EAE3] pb-3">
              <PlusCircle className="w-4 h-4 text-[#5C2D14]" />
              <h3 className="text-sm font-bold text-[#1A0A04]">Add New Campus / College</h3>
            </div>

            <form onSubmit={handleAddCollege} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">College Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Campus Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g. IITB"
                    value={newCollegeCode}
                    onChange={(e) => setNewCollegeCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04] uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Campus Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Powai, Mumbai"
                    value={newCollegeLocation}
                    onChange={(e) => setNewCollegeLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Fixed Pickup Point</label>
                  <input
                    type="text"
                    placeholder="e.g. SAC Ground Floor Counter"
                    value={newCollegePickupPoint}
                    onChange={(e) => setNewCollegePickupPoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isAddingCollege || !newCollegeName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5C2D14]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAddingCollege ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Campus to Directory</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7C5542]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search colleges by name, short code, or location..."
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04] shadow-2xs"
            />
          </div>

          {/* Colleges Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges
              .filter(c => {
                if (!collegeSearch.trim()) return true;
                const q = collegeSearch.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  c.code.toLowerCase().includes(q) ||
                  (c.location && c.location.toLowerCase().includes(q)) ||
                  (c.pickupPoint && c.pickupPoint.toLowerCase().includes(q))
                );
              })
              .map(college => {
                const id = college.id || college._id || college.name;
                return (
                  <div 
                    key={id} 
                    className="bg-[#FFF8EE] p-5 rounded-3xl border border-[#F3EAE3] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#5C2D14]/10 text-[#3B1C0D] border border-[#5C2D14]/25 uppercase">
                          {college.code}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#1A0A04] group-hover:text-[#5C2D14] transition-colors">
                        {college.name}
                      </h4>

                      {college.location && (
                        <p className="text-xs text-[#7C5542] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#7C5542]/70 shrink-0" />
                          <span>{college.location}</span>
                        </p>
                      )}

                      <div className="bg-[#F5EDE4] p-2.5 rounded-xl border border-[#5C2D14]/20 text-[11px] text-[#7C5542] space-y-0.5">
                        <span className="text-[#7C5542]/70 font-medium block text-[10px]">PICKUP POINT</span>
                        <p className="font-semibold text-[#1A0A04]">{college.pickupPoint}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#5C2D14]/15 flex items-center justify-between">
                      <span className="text-[11px] text-[#7C5542]/70 font-mono">ID: {id.slice(-6)}</span>
                      <button
                        onClick={() => handleDeleteCollege(id, college.name)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#5C2D14]/10 text-[#7C5542] hover:text-[#5C2D14] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete College"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* --- PAYMENTS & QR CODE MANAGEMENT TAB --- */
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-[#FFF8EE] p-5 rounded-3xl border border-[#F3EAE3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5C2D14]/10 text-[#5C2D14] flex items-center justify-center border border-[#5C2D14]/25 shadow-2xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A0A04]">UPI Payments & QR Code Configuration</h2>
                <p className="text-xs text-[#7C5542]">
                  Upload custom UPI payment QR codes directly from your device and manage campus payee information
                </p>
              </div>
            </div>

            <button
              onClick={fetchPaymentConfig}
              className="px-3.5 py-1.5 rounded-xl bg-[#F5EDE4] hover:bg-zinc-100 border border-[#5C2D14]/20 text-xs font-bold text-[#7C5542] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#5C2D14]" />
              <span>Refresh Config</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Active QR Preview & Device Upload */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#5C2D14]" />
                    <h3 className="font-bold text-sm text-[#1A0A04]">Active Checkout Payment QR</h3>
                  </div>
                  {customUpiQrUrl ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Custom Device QR Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      Dynamic Auto QR Active
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#F5EDE4] p-6 rounded-2xl border border-[#5C2D14]/20">
                  <div className="bg-[#FFF8EE] p-3 rounded-2xl border-2 border-[#5C2D14]/25 shadow-xs shrink-0 text-center">
                    <img
                      src={customUpiQrUrl || dynamicQrPreview || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(campusUpiId)}`}
                      alt="Active QR Code"
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                    <p className="text-[10px] text-[#7C5542]/70 mt-2 font-medium">
                      {customUpiQrUrl ? 'Custom Image from Device' : 'Auto-Generated dynamic QR'}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-[#7C5542] flex-1">
                    <div>
                      <span className="text-[#7C5542]/70 block text-[10px] font-bold uppercase tracking-wider">Payee Name</span>
                      <span className="font-bold text-[#1A0A04] text-sm">{campusUpiPayeeName}</span>
                    </div>
                    <div>
                      <span className="text-[#7C5542]/70 block text-[10px] font-bold uppercase tracking-wider">Campus UPI ID</span>
                      <span className="font-mono font-bold text-[#5C2D14] text-sm">{campusUpiId}</span>
                    </div>
                    <p className="text-[11px] text-[#7C5542] leading-relaxed">
                      Students scanning this QR code during checkout will send their cake payment to this verified UPI ID.
                    </p>

                    {customUpiQrUrl && (
                      <button
                        type="button"
                        onClick={handleResetCustomQr}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C2D14] hover:text-[#3B1C0D] underline cursor-pointer pt-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Revert to Auto-Generated Dynamic QR</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload New QR Code from Device */}
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-[#1A0A04] mb-1.5 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#5C2D14]" />
                    <span>Upload New QR Image From Device</span>
                  </h4>
                  <p className="text-[11px] text-[#7C5542] mb-3">
                    If you change your bank account or receive an official standee/scanner image from GPay/PhonePe/Paytm, upload it here to update student checkouts immediately.
                  </p>

                  <div
                    onClick={() => qrUploadInputRef.current?.click()}
                    className="border-2 border-dashed border-[#5C2D14]/20 hover:border-rose-400 hover:bg-[#5C2D14]/10/20 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2"
                  >
                    <input
                      ref={qrUploadInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleQrDeviceUpload(file);
                      }}
                    />
                    <div className="w-10 h-10 rounded-xl bg-[#5C2D14]/10 text-[#5C2D14] flex items-center justify-center mx-auto">
                      {isUploadingQr ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                    </div>
                    <div className="text-xs font-bold text-[#7C5542]">
                      {isUploadingQr ? 'Uploading & Applying QR Image...' : 'Click to Upload QR Image from Device'}
                    </div>
                    <p className="text-[10px] text-[#7C5542]/70">
                      Supports PNG, JPG, JPEG, and WebP (up to 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Account Settings Form */}
            <div className="space-y-6">
              <form onSubmit={handleSavePaymentSettings} className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[#1A0A04] border-b border-[#5C2D14]/15 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5C2D14]" />
                  <span>UPI Account Details</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Campus UPI ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. cakecampus@okhdfcbank"
                    value={campusUpiId}
                    onChange={(e) => setCampusUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs font-mono text-[#1A0A04]"
                    required
                  />
                  <p className="text-[10px] text-[#7C5542]/70">The UPI VPA address that receives payments.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Payee Display Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. CakeCampus Bakery"
                    value={campusUpiPayeeName}
                    onChange={(e) => setCampusUpiPayeeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                    required
                  />
                  <p className="text-[10px] text-[#7C5542]/70">Name displayed in student UPI apps.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7C5542]">Custom QR URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="Auto-populated when uploading from device"
                    value={customUpiQrUrl}
                    onChange={(e) => setCustomUpiQrUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#7C5542] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPaymentSettings}
                  className="w-full py-3 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/60 text-white font-bold text-xs shadow-md shadow-[#5C2D14]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSavingPaymentSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Payment Details</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};
