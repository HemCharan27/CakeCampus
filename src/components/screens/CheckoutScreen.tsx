import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DateTime } from 'luxon';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const IST_ZONE = 'Asia/Kolkata';

export const CheckoutScreen: React.FC = () => {
  const { 
    cart, 
    itemsTotal, 
    setCurrentScreen, 
    setLastCreatedOrder, 
    clearCart,
    customerUser,
    selectedCollege,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useApp();

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const calculateEarliestPickupDate = () => {
    const nowIST = DateTime.now().setZone(IST_ZONE);
    const daysToAdd = nowIST.hour >= 18 ? 2 : 1;
    return nowIST.plus({ days: daysToAdd }).toFormat('yyyy-MM-dd');
  };

  const earliestDateStr = calculateEarliestPickupDate();

  const [name, setName] = useState(customerUser?.name || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [rollNumber, setRollNumber] = useState(customerUser?.rollNumber || '');
  const [cakeMessage, setCakeMessage] = useState('');
  const [pickupDate, setPickupDate] = useState(earliestDateStr);
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<any>(null);

  useEffect(() => {
    if (customerUser) {
      if (customerUser.name && !name) setName(customerUser.name);
      if (customerUser.email && !email) setEmail(customerUser.email);
      if (customerUser.phone && !phone) setPhone(customerUser.phone);
      if (customerUser.rollNumber && !rollNumber) setRollNumber(customerUser.rollNumber);
    }
  }, [customerUser]);

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => res.json())
      .then(data => setServerConfig(data))
      .catch(err => console.warn('Failed to load server config:', err));
  }, []);

  if (cart.length === 0 && step === 'details') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-[#7C5542]">Your cart is empty</p>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="px-4 py-2 rounded-xl bg-[#5C2D14] text-[#1A0A04] text-xs font-bold cursor-pointer"
        >
          Browse Bakery Menu
        </button>
      </div>
    );
  }

  const localDeliveryCharge = serverConfig?.deliveryCharge ?? 50;
  const localGrandTotal = itemsTotal + localDeliveryCharge;

  const handleCopy = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard?.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const processImageFile = (file: File) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit.');
      return;
    }
    
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setScreenshotBase64(base64);
        setScreenshotPreview(base64);
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!name || !name.trim()) return 'Please enter your full name.';
    
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    
    if (!email || !email.trim() || !email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    
    if (!rollNumber || !rollNumber.trim()) {
      return 'Please enter your student roll number.';
    }
    
    // Delivery/Pickup Date is strictly mandatory
    if (!pickupDate || !pickupDate.trim()) {
      return 'Delivery/Pickup Date is mandatory before proceeding.';
    }

    // Check cutoff rule in IST
    try {
      const selectedDateIST = DateTime.fromISO(pickupDate.trim(), { zone: IST_ZONE }).startOf('day');
      const cutoffIST = selectedDateIST.minus({ days: 1 }).set({ hour: 18, minute: 0, second: 0, millisecond: 0 });
      const nowIST = DateTime.now().setZone(IST_ZONE);

      if (nowIST > cutoffIST) {
        return 'Orders for this date close at 6:00 PM the previous day. Please choose a future pickup date.';
      }
    } catch {
      // ignore
    }

    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const orderPayload = {
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          rollNumber: rollNumber.trim().toUpperCase(),
          college: selectedCollege?.name || customerUser?.college || ''
        },
        college: selectedCollege?.name || customerUser?.college || '',
        pickupPoint: selectedCollege?.pickupPoint || 'CakeCampus Point',
        cakeMessage: cakeMessage.trim(),
        pickupDate: pickupDate.trim(),
        items: cart.map(item => ({
          cakeId: item.cakeId,
          weightKey: item.weightKey,
          flavourKey: item.flavourKey,
          toppingKeys: item.toppingKeys || [],
          addOnKeys: item.addOnKeys || [],
          qty: item.qty,
        }))
      };

      const createRes = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to place order.');
      }

      setCreatedOrder(orderData);
      setStep('payment');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'An error occurred while placing your order.');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiUtr || upiUtr.trim().length < 8) {
      setErrorMessage('Please enter a valid UTR number (at least 8 characters).');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const orderId = createdOrder.orderId || createdOrder.order?.orderId;
      let screenshotUrl: string | undefined;
      if (screenshotBase64) {
        const uploadRes = await fetch(`${API_BASE}/api/uploads/payment-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: screenshotBase64 })
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.screenshotUrl) throw new Error(uploadData.error || 'Failed to upload screenshot.');
        screenshotUrl = uploadData.screenshotUrl;
      }

      const res = await fetch(`${API_BASE}/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: upiUtr.trim(),
          screenshotUrl
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment details.');
      }

      const finalOrder = data.order || createdOrder.order || { orderId, totalAmount: localGrandTotal, status: 'PAYMENT_SUBMITTED' };
      setLastCreatedOrder(finalOrder);
      clearCart();
      setIsLoading(false);
      setCurrentScreen('success');
    } catch (err: any) {
      console.error('Payment submit error:', err);
      setErrorMessage(err.message || 'An error occurred while submitting payment details.');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Payment data for step 2
  const finalOrderId = createdOrder?.orderId || createdOrder?.order?.orderId || '';
  const finalUpiId = createdOrder?.upiId || serverConfig?.campusUpiId || 'cakecampus@okhdfcbank';
  const finalPayeeName = createdOrder?.payeeName || 'CakeCampus';
  const finalTotalAmount = createdOrder?.totalAmount || localGrandTotal;
  const upiNote = createdOrder?.upiNote || `CakeCampus ${finalOrderId}`;
  const upiIntentUrl = `upi://pay?pa=${finalUpiId}&pn=${encodeURIComponent(finalPayeeName)}&am=${finalTotalAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const customQr = createdOrder?.customUpiQrUrl || serverConfig?.customUpiQrUrl;
  const qrImageUrl = customQr || (createdOrder?.upiQrString?.startsWith('http') ? createdOrder.upiQrString : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUrl)}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Back button */}
      <button
        onClick={() => step === 'payment' ? setStep('details') : setCurrentScreen('cart')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C5542] hover:text-[#1A0A04] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{step === 'payment' ? 'Back to Order Details' : 'Back to Cart'}</span>
      </button>

      <div className="border-b border-[#5C2D14]/15 pb-3">
        <h1 className="text-2xl font-black text-[#1A0A04] font-serif">
          {step === 'details' ? 'Pre-Order Checkout' : 'Complete Payment'}
        </h1>
        <p className="text-xs text-[#7C5542]">
          {step === 'details' 
            ? 'Enter student details and choose scheduled pickup date'
            : 'Scan QR to pay and submit transaction details for verification'
          }
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#5C2D14]/10 border border-[#5C2D14]/25 text-[#1A0A04] text-xs font-semibold flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#5C2D14] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Notice</p>
            <p className="font-normal text-[#7C5542] mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Details & Date */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pickup Point Notice */}
            <div className="bg-[#FFF8EE] p-5 rounded-2xl border border-[#5C2D14]/15 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#5C2D14]" />
                  <span>Pickup Location</span>
                </h2>
                <span className="text-[11px] bg-[#5C2D14]/10 text-[#3B1C0D] font-bold px-2.5 py-0.5 rounded-full border border-[#5C2D14]/25">
                  Fixed Point
                </span>
              </div>
              <div className="bg-[#F5EDE4] p-3.5 rounded-xl border border-[#5C2D14]/20">
                <p className="text-sm font-bold text-[#1A0A04]">CakeCampus Point</p>
                <p className="text-xs text-[#7C5542] mt-0.5">
                  Central Campus • Student Activity Center Hub (Ground Floor)
                </p>
              </div>
            </div>

            {/* Pickup Date */}
            <div className="bg-[#FFF8EE] p-5 rounded-2xl border-2 border-[#5C2D14]/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="pickup-date-input" className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#5C2D14]" />
                  <span>Delivery / Pickup Date <span className="text-[#5C2D14] font-black">* REQUIRED</span></span>
                </label>
                <span className="text-[11px] bg-[#5C2D14]/15 text-[#7C5542] font-bold px-2 py-0.5 rounded-md">
                  Strict 6 PM Cutoff
                </span>
              </div>

              <div className="space-y-2">
                <input
                  id="pickup-date-input"
                  type="date"
                  min={earliestDateStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F5EDE4] border-2 border-[#5C2D14]/25 focus:border-[#5C2D14] focus:outline-hidden text-sm font-bold text-[#1A0A04]"
                />
                <div className="bg-[#5C2D14]/10 p-3 rounded-xl border border-[#5C2D14]/25 text-xs text-[#1A0A04] flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#5C2D14] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Cutoff Policy:</p>
                    <p className="text-[11px] text-[#7C5542] mt-0.5">
                      Orders for this date close at <strong>6:00 PM the previous day</strong>. Earliest available pickup date is <strong>{DateTime.fromISO(earliestDateStr).toFormat('dd LLL yyyy')}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-[#FFF8EE] p-5 rounded-2xl border border-[#5C2D14]/15 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C2D14]/15 pb-3">
                <h2 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                  Student / Customer Details
                </h2>
                {customerUser ? (
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Auto-filled from {customerUser.name}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('google');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-[11px] text-[#5C2D14] hover:text-[#7C5542] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#5C2D14]" />
                    <span>Sign in with Google to auto-fill</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7C5542]">
                    Full Name <span className="text-[#5C2D14]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Charan Veesam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/[<>\{}]/g, '') }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7C5542]">
                    Mobile Phone Number <span className="text-[#5C2D14]">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9848034567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={10}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7C5542]">
                    Email Address <span className="text-[#5C2D14]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7C5542]">
                    Student Roll Number <span className="text-[#5C2D14]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21VV1A0589"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    maxLength={30}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9\-\/]/g, '') }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04] uppercase"
                  />
                </div>
              </div>

              {/* Cake Message */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-[#7C5542]">
                  Message or Name on Cake (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Happy 20th Birthday Ananya! 🎉"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  maxLength={45}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/[<>\{}]/g, '') }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EDE4] border border-[#5C2D14]/20 focus:border-[#5C2D14] focus:outline-hidden text-xs text-[#1A0A04]"
                />
                <span className="text-[10px] text-[#7C5542]/70 block text-right">Max 45 chars</span>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Summary & Place Order Button */}
          <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/15 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#1A0A04] border-b border-[#5C2D14]/15 pb-3">
              Order Summary
            </h2>

            {/* Items Recap */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-[#7C5542] pb-1.5 border-b border-[#5C2D14]/15">
                  <div>
                    <span className="font-semibold text-[#1A0A04]">{item.qty}x {item.cakeName}</span>
                    <span className="block text-[10px] text-[#7C5542]/70">{item.weightKey} • {item.flavourKey}</span>
                  </div>
                  <span className="font-bold text-[#1A0A04]">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs text-[#7C5542] pt-2 border-t border-[#5C2D14]/15">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-semibold text-[#1A0A04]">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Delivery Charge</span>
                <span className="font-semibold text-[#1A0A04]">₹{localDeliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-[#5C2D14]/20 flex justify-between items-baseline font-bold text-sm text-[#1A0A04]">
                <span>Total Payable</span>
                <span className="text-xl text-[#5C2D14] font-black">₹{localGrandTotal}</span>
              </div>
            </div>

            {/* Payment Trust Badges */}
            <div className="bg-[#F5EDE4] p-3 rounded-xl border border-[#5C2D14]/15 space-y-1.5 text-[11px] text-[#7C5542]">
              <div className="flex items-center gap-1.5 font-bold text-[#1A0A04]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Campus Secure Pre-Order</span>
              </div>
              <p className="text-[10px] text-[#7C5542]">
                Pickup date is locked and scheduled fresh for CakeCampus Point.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/60 text-[#1A0A04] font-bold text-sm shadow-lg shadow-[#5C2D14]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {step === 'payment' && (
        <form onSubmit={handlePaymentSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[#FFF8EE] p-6 rounded-3xl border-2 border-[#5C2D14]/30 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-[#1A0A04] flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-[#5C2D14]" />
                Scan to Pay
              </h2>
              <p className="text-sm text-[#7C5542] font-medium">Order ID: <span className="font-mono font-bold text-[#1A0A04]">{finalOrderId}</span></p>
            </div>

            <div className="bg-[#F5EDE4] p-6 rounded-2xl border border-[#5C2D14]/20 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative bg-[#FFF8EE] p-3 rounded-2xl border-2 border-[#5C2D14]/25 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt="Campus UPI QR"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-[#7C5542]">Amount to Pay</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-black text-[#5C2D14] font-serif">₹{finalTotalAmount}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(finalTotalAmount.toString(), 'amount')}
                      className="p-1.5 rounded-lg bg-[#5C2D14]/15 hover:bg-[#5C2D14]/20 text-[#7C5542] cursor-pointer transition-colors"
                      title="Copy Amount"
                    >
                      {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="bg-[#FFF8EE] p-3 rounded-xl border border-[#5C2D14]/20 flex items-center justify-between gap-3">
                    <div className="truncate">
                      <span className="text-xs text-[#7C5542] block font-semibold mb-0.5">UPI ID</span>
                      <span className="font-mono font-bold text-[#1A0A04]">{finalUpiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(finalUpiId, 'upi')}
                      className="px-3 py-1.5 rounded-lg bg-[#F5EDE4] hover:bg-[#5C2D14]/15 text-[#7C5542] font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct UPI App launcher */}
                <a
                  href={upiIntentUrl}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Pay via UPI App (GPay / PhonePe / Paytm) ↗</span>
                </a>
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-[#5C2D14]/20">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A0A04] block">
                  UPI UTR / Transaction Reference Number <span className="text-[#5C2D14]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 312345678901"
                  value={upiUtr}
                  onChange={(e) => setUpiUtr(e.target.value)}
                  minLength={8}
                  maxLength={30}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9]/g, '') }}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF8EE] border-2 border-[#5C2D14]/25 focus:border-[#5C2D14] focus:outline-hidden font-mono text-sm text-[#1A0A04] font-bold tracking-wider"
                />
                <p className="text-xs text-[#7C5542]">Enter the 12-digit reference number from your payment app.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1A0A04] block">
                  Payment Screenshot (Optional)
                </label>
                
                {!screenshotPreview ? (
                  <label className="border-2 border-dashed border-[#5C2D14]/25 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-[#F5EDE4] hover:bg-[#5C2D14]/10 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-[#7C5542]/70" />
                    <span className="text-xs font-semibold text-[#7C5542]">Click to upload screenshot</span>
                    <span className="text-[10px] text-[#7C5542]/70">JPEG, PNG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => e.target.files && processImageFile(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={screenshotPreview} alt="Screenshot Preview" className="h-32 rounded-lg border border-[#5C2D14]/20 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotPreview(null);
                        setScreenshotBase64(null);
                      }}
                      className="absolute -top-2 -right-2 bg-[#5C2D14]/15 text-[#5C2D14] p-1 rounded-full hover:bg-[#5C2D14]/25 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[#5C2D14]/8 p-3 rounded-xl border border-amber-200 flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-900 font-medium">
                  ⚠️ <strong>Warning:</strong> Fake payment details or invalid UTRs will lead to immediate order cancellation.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !upiUtr || upiUtr.length < 8}
                className="w-full py-4 rounded-xl bg-[#5C2D14] hover:bg-[#3B1C0D] disabled:bg-[#5C2D14]/60 text-[#1A0A04] font-bold text-sm shadow-lg shadow-[#5C2D14]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

