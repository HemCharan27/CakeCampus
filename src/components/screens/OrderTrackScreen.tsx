import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
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
  Cake,
  ArrowLeft,
  ArrowRight,
  User,
  ShoppingBag,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { CanonicalOrderStatus, OrderData } from '../../types';

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
    setCurrentScreen,
    customerUser,
    customerOrders,
    fetchCustomerOrders,
    setIsAuthModalOpen,
    setAuthModalMode,
    trackingOrderId
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(trackingOrderId || null);

  // Fetch fresh orders on component mount
  useEffect(() => {
    if (customerUser) {
      setIsLoading(true);
      fetchCustomerOrders().finally(() => setIsLoading(false));
    }
  }, [customerUser?.id]);

  // Default to selecting trackingOrderId or the first order if none selected
  useEffect(() => {
    if (trackingOrderId) {
      setSelectedOrderId(trackingOrderId);
    } else if (!selectedOrderId && customerOrders.length > 0) {
      setSelectedOrderId(customerOrders[0].orderId);
    }
  }, [customerOrders, trackingOrderId]);

  const getStepIndex = (status: CanonicalOrderStatus): number => {
    if (status === 'CANCELLED') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  // Selected Order Object
  const activeOrder: OrderData | undefined = customerOrders.find(o => o.orderId === selectedOrderId) || customerOrders[0];
  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  // 1. Not Logged In State
  if (!customerUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#23120B] border border-[#5C2D14]/30 text-[#7C5542] flex items-center justify-center mx-auto shadow-md">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#1A0A04] font-serif">Sign In to View Orders</h1>
          <p className="text-xs sm:text-sm text-[#7C5542] max-w-sm mx-auto">
            Please sign in with your student account to view your past and active cake pre-orders history.
          </p>
        </div>
        <button
          onClick={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  // 2. Logged In But No Orders State
  if (!isLoading && customerOrders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#23120B] border border-[#5C2D14]/30 text-[#7C5542] flex items-center justify-center mx-auto shadow-md">
          <PackageCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#1A0A04] font-serif">No Pre-Orders Yet</h1>
          <p className="text-xs sm:text-sm text-[#7C5542] max-w-sm mx-auto">
            You haven't placed any cake pre-orders yet with your account ({customerUser.email}).
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Cake className="w-4 h-4" />
          <span>Browse Bakery Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#5C2D14]/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A0A04] font-serif">
            My Order History
          </h1>
          <p className="text-xs sm:text-sm text-[#7C5542]">
            Account: <strong>{customerUser.name}</strong> ({customerUser.email}) • {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchCustomerOrders().finally(() => setIsLoading(false));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#23120B] border border-[#5C2D14]/30 text-xs font-bold text-[#7C5542] hover:bg-[#2D160D] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: List of All Customer Orders */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide flex items-center justify-between">
            <span>All Account Orders</span>
            <span className="text-[11px] text-[#7C5542] font-semibold">{customerOrders.length}</span>
          </h2>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {customerOrders.map((order) => {
              const isSelected = activeOrder?.orderId === order.orderId;
              const pickupDateStr = typeof order.pickupDate === 'string'
                ? order.pickupDate.split('T')[0]
                : new Date(order.pickupDate).toISOString().split('T')[0];

              return (
                <div
                  key={order.orderId}
                  onClick={() => setSelectedOrderId(order.orderId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#FFF8EE] border-[#5C2D14] ring-2 ring-[#5C2D14]/20 shadow-md'
                      : 'bg-[#FFF8EE]/60 hover:bg-[#FFF8EE] border-[#5C2D14]/20 hover:border-[#5C2D14]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-[#5C2D14]">
                      {order.orderId}
                    </span>
                    <span className="text-[10px] bg-[#23120B] text-[#7C5542] font-bold px-2 py-0.5 rounded-full border border-[#5C2D14]/30">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-0.5">
                    <p className="text-[#1A0A04] font-bold line-clamp-1">
                      {order.items.map(i => `${i.qty}x ${i.cakeNameSnapshot}`).join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#7C5542] pt-1">
                      <span>Pickup: {pickupDateStr}</span>
                      <span className="font-bold text-[#1A0A04]">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View of Selected Order */}
        {activeOrder ? (
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C2D14]/15 pb-4">
                <div>
                  <span className="text-[10px] text-[#7C5542]/70 font-bold uppercase tracking-wider block">Order Reference</span>
                  <span className="text-xl font-black text-[#5C2D14] font-mono tracking-wide">
                    {activeOrder.orderId}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#7C5542]/70 font-bold uppercase tracking-wider block">Student Details</span>
                  <span className="text-xs font-bold text-[#1A0A04]">
                    {activeOrder.customer.name} ({activeOrder.customer.rollNumber})
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {activeOrder.status === 'CANCELLED' ? (
                <div className="bg-[#5C2D14]/10 border border-[#5C2D14]/25 p-4 rounded-2xl flex items-center gap-3 text-[#1A0A04]">
                  <XCircle className="w-6 h-6 text-[#5C2D14] shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Order Cancelled</h3>
                    <p className="text-xs text-[#7C5542]">This pre-order was cancelled by administration.</p>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-4">
                  <div className="relative flex items-center justify-between">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-[#5C2D14]/15 -z-0">
                      <div 
                        className="h-full bg-[#5C2D14] transition-all duration-500"
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
                              ? 'bg-[#5C2D14] text-[#1A0A04] shadow-md shadow-[#5C2D14]/30' 
                              : 'bg-[#FFF8EE] border-2 border-[#5C2D14]/25 text-[#7C5542]/70'
                          } ${isCurrent ? 'ring-4 ring-[#5C2D14]/20 scale-110' : ''}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold text-center max-w-[60px] sm:max-w-none ${
                            isCurrent ? 'text-[#5C2D14]' : isDone ? 'text-[#1A0A04]' : 'text-[#7C5542]/70'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#F5EDE4] p-3.5 rounded-xl border border-[#5C2D14]/20 text-xs text-[#7C5542] text-center">
                    Current Status: <strong className="text-[#5C2D14]">{STATUS_STEPS[currentStepIdx]?.label || activeOrder.status}</strong>
                    <p className="text-[11px] text-[#7C5542] mt-0.5">{STATUS_STEPS[currentStepIdx]?.desc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Details & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FFF8EE] p-5 rounded-2xl border border-[#5C2D14]/20 shadow-sm space-y-2.5">
                <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#5C2D14]" />
                  <span>Pickup Details</span>
                </h3>
                <div className="text-xs space-y-1.5 text-[#7C5542]">
                  <p><strong>Point:</strong> <span className="text-[#1A0A04] font-bold">{activeOrder.pickupPoint}</span></p>
                  <p><strong>Scheduled Date:</strong> <span className="text-[#1A0A04] font-bold">{typeof activeOrder.pickupDate === 'string' ? activeOrder.pickupDate.split('T')[0] : ''}</span></p>
                  {activeOrder.cakeMessage && (
                    <p><strong>Cake Message:</strong> <em>"{activeOrder.cakeMessage}"</em></p>
                  )}
                </div>
              </div>

              <div className="bg-[#FFF8EE] p-5 rounded-2xl border border-[#5C2D14]/20 shadow-sm space-y-2.5">
                <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                  Payment Summary
                </h3>
                <div className="text-xs space-y-1 text-[#7C5542]">
                  <div className="flex justify-between">
                    <span>Items Total:</span>
                    <span>₹{activeOrder.itemsTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Campus Delivery Charge:</span>
                    <span>₹{activeOrder.deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#1A0A04] pt-1.5 border-t border-[#5C2D14]/15">
                    <span>Grand Total:</span>
                    <span className="text-[#5C2D14] font-black">₹{activeOrder.totalAmount}</span>
                  </div>
                  {activeOrder.payment?.utr && (
                    <p className="text-[11px] text-[#7C5542] pt-1 font-mono">
                      UTR: {activeOrder.payment.utr}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="bg-[#FFF8EE] p-5 rounded-2xl border border-[#5C2D14]/20 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">
                Items Included in Order
              </h3>
              <div className="divide-y divide-[#5C2D14]/15 text-xs">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#1A0A04]">{item.qty}x {item.cakeNameSnapshot}</p>
                      <p className="text-[11px] text-[#7C5542]">
                        {item.weightKey} • {item.flavourKey}
                        {item.toppingKeys?.length ? ` • Toppings: ${item.toppingKeys.join(', ')}` : ''}
                        {item.addOnKeys?.length ? ` • Add-ons: ${item.addOnKeys.join(', ')}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-[#1A0A04]">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
