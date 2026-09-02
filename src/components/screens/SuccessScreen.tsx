import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, MapPin, Clock, Copy, SearchCheck, Cake } from 'lucide-react';

export const SuccessScreen: React.FC = () => {
  const { lastCreatedOrder, setCurrentScreen, setTrackingOrderId, setTrackingPhoneOrEmail } = useApp();

  useEffect(() => {
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 }, colors: ['#5C2D14', '#7C5542', '#23120B', '#FFF8EE'] });
    } catch { /* ignore */ }
  }, []);

  if (!lastCreatedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-[#7C5542]">No recent order found</p>
        <button onClick={() => setCurrentScreen('home')} className="px-4 py-2 rounded-xl bg-[#5C2D14] text-[#1A0A04] text-xs font-bold">Return Home</button>
      </div>
    );
  }

  const pickupDateFormatted = typeof lastCreatedOrder.pickupDate === 'string'
    ? lastCreatedOrder.pickupDate.split('T')[0]
    : new Date(lastCreatedOrder.pickupDate).toISOString().split('T')[0];

  const handleTrack = () => {
    setTrackingOrderId(lastCreatedOrder.orderId);
    setTrackingPhoneOrEmail(lastCreatedOrder.customer.phone || lastCreatedOrder.customer.email);
    setCurrentScreen('track');
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(lastCreatedOrder.orderId);
    alert(`Copied Order ID: ${lastCreatedOrder.orderId}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-6">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-[#1A0A04] to-[#23120B] p-6 sm:p-8 rounded-3xl border border-[#5C2D14]/25 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#5C2D14]/5 pointer-events-none" />
        <div className="w-16 h-16 rounded-full bg-[#5C2D14]/20 text-[#7C5542] border border-[#5C2D14]/40 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] bg-[#5C2D14]/20 text-[#7C5542] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#5C2D14]/30">
            Payment Submitted — Awaiting Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-50 font-serif pt-2">Order Placed Successfully! ??</h1>
          <p className="text-xs sm:text-sm text-amber-200/70 max-w-md mx-auto">
            Thank you, <strong className="text-amber-100">{lastCreatedOrder.customer.name}</strong>! Your payment details have been submitted. We'll verify and confirm your order shortly.
          </p>
        </div>
        <div className="bg-[#1A0A04]/80 p-4 rounded-2xl border border-[#5C2D14]/30 inline-flex items-center gap-3">
          <div>
            <span className="text-[10px] text-[#5C2D14]/70 font-bold uppercase tracking-wider block">Your Order ID</span>
            <span className="text-lg sm:text-xl font-black text-[#7C5542] font-mono tracking-wider">{lastCreatedOrder.orderId}</span>
          </div>
          <button onClick={copyOrderId} className="p-2 rounded-xl bg-[#5C2D14]/15 hover:bg-[#5C2D14]/25 border border-[#5C2D14]/30 text-[#7C5542] text-xs flex items-center gap-1 cursor-pointer" title="Copy Order ID">
            <Copy className="w-3.5 h-3.5" /><span className="text-[11px] font-semibold">Copy</span>
          </button>
        </div>
      </div>

      {/* Pickup Instructions */}
      <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#5C2D14]" /><span>Campus Pickup Instructions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-[#F5EDE4] p-3.5 rounded-xl border border-[#5C2D14]/15 space-y-1">
            <span className="text-[#7C5542] font-medium">Pickup Point</span>
            <p className="font-bold text-[#1A0A04] text-sm">CakeCampus Point</p>
            <p className="text-[11px] text-[#7C5542]">Student Activity Center Ground Floor</p>
          </div>
          <div className="bg-[#F5EDE4] p-3.5 rounded-xl border border-[#5C2D14]/15 space-y-1">
            <span className="text-[#7C5542] font-medium">Scheduled Date</span>
            <p className="font-bold text-[#1A0A04] text-sm">{pickupDateFormatted}</p>
            <p className="text-[11px] text-[#7C5542]">Baked fresh on the morning of pickup</p>
          </div>
        </div>
        <div className="bg-[#5C2D14]/10 p-3.5 rounded-xl border border-[#5C2D14]/25 text-xs space-y-1">
          <p className="font-bold text-[#1A0A04]">What to bring for collection:</p>
          <p className="text-[11px] text-[#7C5542] leading-relaxed">
            Show your Order ID <strong className="font-mono text-[#5C2D14]">{lastCreatedOrder.orderId}</strong> or your roll number <strong className="text-[#1A0A04]">{lastCreatedOrder.customer.rollNumber}</strong> at CakeCampus Point counter.
          </p>
        </div>
      </div>

      {/* Items Snapshot */}
      <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-[#1A0A04] uppercase tracking-wide">Ordered Items Snapshot</h2>
        <div className="divide-y divide-[#5C2D14]/10 text-xs">
          {lastCreatedOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between">
              <div>
                <p className="font-bold text-[#1A0A04]">{item.qty}x {item.cakeNameSnapshot}</p>
                <p className="text-[11px] text-[#7C5542]">
                  {item.weightKey} &bull; {item.flavourKey}
                  {item.toppingKeys?.length ? ` • Toppings: ${item.toppingKeys.join(', ')}` : ''}
                  {item.addOnKeys?.length ? ` • Add-ons: ${item.addOnKeys.join(', ')}` : ''}
                </p>
              </div>
              <span className="font-bold text-[#1A0A04]">&#8377;{item.lineTotal}</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between text-[#7C5542] font-medium"><span>Campus Delivery Charge</span><span>&#8377;{lastCreatedOrder.deliveryCharge}</span></div>
          <div className="pt-2 flex justify-between font-bold text-sm text-[#1A0A04]">
            <span>Total Amount</span><span className="text-[#5C2D14]">&#8377;{lastCreatedOrder.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={handleTrack} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
          <SearchCheck className="w-4 h-4" /><span>Track Order Status</span>
        </button>
        <button onClick={() => setCurrentScreen('catalog')} className="flex-1 py-3.5 rounded-xl bg-[#FFF8EE] hover:bg-[#F5EDE4] text-[#1A0A04] border border-[#5C2D14]/25 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Cake className="w-4 h-4" /><span>Order Another Cake</span>
        </button>
      </div>
    </div>
  );
};
