import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Copy, 
  SearchCheck, 
  Cake, 
  Mail, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SuccessScreen: React.FC = () => {
  const { lastCreatedOrder, setCurrentScreen, setTrackingOrderId, setTrackingPhoneOrEmail } = useApp();

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  if (!lastCreatedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-zinc-500">No recent order found</p>
        <button
          onClick={() => setCurrentScreen('home')}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Return Home
        </button>
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F3EAE3] shadow-sm text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Payment Submitted — Awaiting Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2A050F] font-serif pt-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Thank you, <strong className="text-zinc-800">{lastCreatedOrder.customer.name}</strong>! Your payment details have been submitted. We'll verify and confirm your order shortly.
          </p>
        </div>

        {/* Order ID Callout */}
        <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#E8DED6] inline-flex items-center gap-3">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Your Order ID</span>
            <span className="text-lg sm:text-xl font-black text-rose-600 font-mono tracking-wider">
              {lastCreatedOrder.orderId}
            </span>
          </div>
          <button
            onClick={copyOrderId}
            className="p-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Copy Order ID"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Copy</span>
          </button>
        </div>
      </div>

      {/* Pickup Instructions Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>Campus Pickup Instructions</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8DED6] space-y-1">
            <span className="text-zinc-500 font-medium">Pickup Point</span>
            <p className="font-bold text-[#2A050F] text-sm">CakeCampus Point</p>
            <p className="text-[11px] text-zinc-400">Student Activity Center Ground Floor</p>
          </div>

          <div className="bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8DED6] space-y-1">
            <span className="text-zinc-500 font-medium">Scheduled Date</span>
            <p className="font-bold text-[#2A050F] text-sm">{pickupDateFormatted}</p>
            <p className="text-[11px] text-zinc-400">Baked fresh on the morning of pickup</p>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
          <p className="font-bold">What to bring for collection:</p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Simply show your Order ID <strong className="font-mono font-bold">{lastCreatedOrder.orderId}</strong> or your roll number <strong>{lastCreatedOrder.customer.rollNumber}</strong> at CakeCampus Point counter.
          </p>
        </div>
      </div>

      {/* Order Summary Snapshot */}
      <div className="bg-white p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
          Ordered Items Snapshot
        </h2>

        <div className="divide-y divide-zinc-100 text-xs">
          {lastCreatedOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between">
              <div>
                <p className="font-bold text-[#2A050F]">{item.qty}x {item.cakeNameSnapshot}</p>
                <p className="text-[11px] text-zinc-500">
                  {item.weightKey} • {item.flavourKey}
                  {item.toppingKeys?.length ? ` • Toppings: ${item.toppingKeys.join(', ')}` : ''}
                  {item.addOnKeys?.length ? ` • Add-ons: ${item.addOnKeys.join(', ')}` : ''}
                </p>
              </div>
              <span className="font-bold text-zinc-900">₹{item.lineTotal}</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between text-zinc-600 font-medium">
            <span>Campus Delivery Charge</span>
            <span>₹{lastCreatedOrder.deliveryCharge}</span>
          </div>
          <div className="pt-2 flex justify-between font-bold text-sm text-[#2A050F]">
            <span>Total Amount</span>
            <span className="text-rose-600">₹{lastCreatedOrder.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleTrack}
          className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <SearchCheck className="w-4 h-4" />
          <span>Track Order Status</span>
        </button>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="flex-1 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Cake className="w-4 h-4" />
          <span>Order Another Cake</span>
        </button>
      </div>
    </div>
  );
};
