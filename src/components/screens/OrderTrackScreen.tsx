import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChefHat, 
  PackageCheck, 
  PartyPopper,
  XCircle,
  CreditCard,
  Cake
} from 'lucide-react';
import { CanonicalOrderStatus } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface TrackedOrderData {
  orderId: string;
  customerName: string;
  rollNumber: string;
  pickupDate: string;
  pickupPoint: string;
  cakeMessage?: string;
  status: CanonicalOrderStatus;
  items: any[];
  itemsTotal: number;
  deliveryCharge: number;
  totalAmount: number;
  createdAt: string;
}

const STATUS_STEPS: { key: CanonicalOrderStatus; label: string; desc: string; icon: any }[] = [
  { key: 'PAYMENT_PENDING', label: 'Payment Pending', desc: 'Waiting for UPI payment & UTR submission', icon: CreditCard },
  { key: 'PAYMENT_SUBMITTED', label: 'Payment Submitted', desc: 'UTR submitted — awaiting admin verification', icon: Clock },
  { key: 'PAID_VERIFIED', label: 'Payment Verified', desc: 'Payment confirmed — order scheduled with baker', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing Fresh', desc: 'Artisanal cake is being baked & frosted', icon: ChefHat },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Waiting at CakeCampus Point', icon: PackageCheck },
  { key: 'COMPLETED', label: 'Completed', desc: 'Cake picked up by student', icon: PartyPopper },
];

export const OrderTrackScreen: React.FC = () => {
  const { 
    trackingOrderId, 
    setTrackingOrderId, 
    trackingPhoneOrEmail, 
    setTrackingPhoneOrEmail, 
    setCurrentScreen,
    customerUser,
    customerOrders
  } = useApp();

  const [orderIdInput, setOrderIdInput] = useState(trackingOrderId || '');
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState(trackingPhoneOrEmail || customerUser?.email || customerUser?.phone || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrderData | null>(null);

  const fetchTrackOrder = async (orderId: string, phoneOrEmail: string) => {
    if (!orderId.trim() || !phoneOrEmail.trim()) {
      setErrorMessage('Please enter both your Order ID and registered Phone number / Email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phoneOrEmail.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching order found.');
      }

      setTrackedOrder(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve order tracking info.');
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackingOrderId && trackingPhoneOrEmail) {
      setOrderIdInput(trackingOrderId);
      setPhoneOrEmailInput(trackingPhoneOrEmail);
      fetchTrackOrder(trackingOrderId, trackingPhoneOrEmail);
    }
  }, [trackingOrderId, trackingPhoneOrEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackOrder(orderIdInput, phoneOrEmailInput);
  };

  const handleQuickTrack = (orderId: string, emailOrPhone: string) => {
    setOrderIdInput(orderId);
    setPhoneOrEmailInput(emailOrPhone);
    fetchTrackOrder(orderId, emailOrPhone);
  };

  const getStepIndex = (status: CanonicalOrderStatus): number => {
    if (status === 'CANCELLED') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5 max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-[#2A050F] font-serif">
          Track Your Pre-Order
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Enter your Order ID (e.g. CC-123456) and registered phone number or email
        </p>
      </div>

      {/* Customer Quick Order Selector if logged in */}
      {customerUser && customerOrders.length > 0 && !trackedOrder && (
        <div className="bg-white p-5 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-rose-600" />
              <span>Your Recent Orders</span>
            </h2>
            <span className="text-[11px] text-zinc-400 font-semibold">{customerOrders.length} pre-orders</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {customerOrders.map(order => {
              const pickupDateStr = typeof order.pickupDate === 'string'
                ? order.pickupDate.split('T')[0]
                : new Date(order.pickupDate).toISOString().split('T')[0];

              return (
                <div
                  key={order.orderId}
                  onClick={() => handleQuickTrack(order.orderId, customerUser.email)}
                  className="p-3 rounded-2xl bg-[#FAF7F5] hover:bg-rose-50/60 border border-[#E8DED6] hover:border-rose-300 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-600">{order.orderId}</span>
                      <span className="text-[10px] bg-white text-zinc-700 font-semibold px-2 py-0.5 rounded border border-zinc-200">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Pickup: <strong>{pickupDateStr}</strong> • ₹{order.totalAmount}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-rose-600 group-hover:underline">
                    Track ↗
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lookup Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">Order ID</label>
            <input
              type="text"
              placeholder="e.g. CC-100234"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs font-mono uppercase text-[#2A050F]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700">Phone Number or Email</label>
            <input
              type="text"
              placeholder="e.g. 9848034567 or student@edu"
              value={phoneOrEmailInput}
              onChange={(e) => setPhoneOrEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking Order Status...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tracked Order Details */}
      {trackedOrder && (
        <div className="space-y-6 animate-fade-in">
          {/* Order Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Order ID</span>
                <span className="text-lg font-black text-rose-600 font-mono tracking-wide">
                  {trackedOrder.orderId}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Student</span>
                <span className="text-xs font-bold text-zinc-800">
                  {trackedOrder.customerName} ({trackedOrder.rollNumber})
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            {trackedOrder.status === 'CANCELLED' ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-900">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Order Cancelled</h3>
                  <p className="text-xs text-rose-800">This order has been cancelled by administration.</p>
                </div>
              </div>
            ) : (
              <div className="py-2 space-y-4">
                <div className="relative flex items-center justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-zinc-200 -z-0">
                    <div 
                      className="h-full bg-rose-600 transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%` }}
                    />
                  </div>

                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                            : 'bg-white border-2 border-zinc-300 text-zinc-400'
                        } ${isCurrent ? 'ring-4 ring-rose-100 scale-110' : ''}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] mt-1.5 font-bold text-center max-w-[60px] sm:max-w-none ${
                          isCurrent ? 'text-rose-600' : isDone ? 'text-zinc-800' : 'text-zinc-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8DED6] text-xs text-zinc-600 text-center">
                  Current Status: <strong className="text-rose-600">{STATUS_STEPS[currentStepIdx]?.label || trackedOrder.status}</strong>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{STATUS_STEPS[currentStepIdx]?.desc}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pickup Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#F3EAE3] shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Pickup Details</span>
              </h3>
              <div className="text-xs space-y-1">
                <p><strong>Point:</strong> {trackedOrder.pickupPoint}</p>
                <p><strong>Date:</strong> {typeof trackedOrder.pickupDate === 'string' ? trackedOrder.pickupDate.split('T')[0] : ''}</p>
                {trackedOrder.cakeMessage && (
                  <p><strong>Cake Message:</strong> <em>"{trackedOrder.cakeMessage}"</em></p>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#F3EAE3] shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
                Payment & Total
              </h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-zinc-600">
                  <span>Items Total:</span>
                  <span>₹{trackedOrder.itemsTotal}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Charge:</span>
                  <span>₹{trackedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#2A050F] pt-1 border-t border-zinc-100">
                  <span>Grand Total:</span>
                  <span className="text-rose-600 font-black">₹{trackedOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-[#F3EAE3] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
              Items in Order
            </h3>
            <div className="divide-y divide-zinc-100 text-xs">
              {trackedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-bold text-[#2A050F]">{item.qty}x {item.cakeNameSnapshot}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {item.weightKey} • {item.flavourKey}
                      {item.toppingKeys?.length ? ` • Toppings: ${item.toppingKeys.join(', ')}` : ''}
                      {item.addOnKeys?.length ? ` • Add-ons: ${item.addOnKeys.join(', ')}` : ''}
                    </span>
                  </div>
                  <span className="font-bold text-zinc-800">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
