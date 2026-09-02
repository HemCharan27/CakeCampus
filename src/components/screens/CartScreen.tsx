import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const CartScreen: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, itemsTotal, deliveryCharge, grandTotal, setCurrentScreen } = useApp();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#23120B] border border-[#5C2D14]/30 text-[#7C5542] flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[#1A0A04] font-serif">Your Cart is Empty</h2>
          <p className="text-xs text-[#7C5542] max-w-sm mx-auto">Choose your favorite cake from our campus catalog and customize size, flavours &amp; toppings.</p>
        </div>
        <button onClick={() => setCurrentScreen('catalog')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer">
          <span>Browse Cake Menu</span><ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      <div className="flex items-center justify-between border-b border-[#5C2D14]/15 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A0A04] font-serif">Your Cake Pre-Order Cart</h1>
          <p className="text-xs text-[#7C5542]">Review your customized cake items before proceeding to checkout</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#23120B] border border-[#5C2D14]/30 text-xs font-bold text-[#7C5542] shadow-sm">
          {cart.length} / 3 Items
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-[#FFF8EE] p-4 sm:p-5 rounded-2xl border border-[#5C2D14]/20 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F5EDE4] shrink-0 border border-[#5C2D14]/20">
                  <img src={item.image} alt={item.cakeName} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#1A0A04] text-sm sm:text-base">{item.cakeName}</h3>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="bg-[#5C2D14]/10 text-[#7C5542] border border-[#5C2D14]/20 px-2 py-0.5 rounded-md font-semibold">{item.weightKey} (&#8377;{item.weightPrice})</span>
                    <span className="bg-[#23120B] text-[#7C5542] px-2 py-0.5 rounded-md font-semibold">{item.flavourKey}{item.flavourExtra > 0 ? ` (+&#8377;${item.flavourExtra})` : ''}</span>
                  </div>
                  {item.toppingKeys?.length > 0 && <p className="text-[11px] text-[#7C5542]"><strong>Toppings:</strong> {item.toppingKeys.join(', ')} (+&#8377;{item.toppingsExtra})</p>}
                  {item.addOnKeys?.length > 0 && <p className="text-[11px] text-[#7C5542]"><strong>Add-ons:</strong> {item.addOnKeys.join(', ')} (+&#8377;{item.addOnsExtra})</p>}
                  <p className="text-xs text-[#7C5542]/70">Unit Price: &#8377;{item.unitPrice}</p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#5C2D14]/15">
                <span className="text-base font-bold text-[#5C2D14]">&#8377;{item.lineTotal}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#F5EDE4] border border-[#5C2D14]/20 rounded-xl p-1">
                    <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 flex items-center justify-center text-[#7C5542] hover:bg-[#5C2D14]/10">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#1A0A04] w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-lg bg-[#FFF8EE] border border-[#5C2D14]/20 flex items-center justify-center text-[#7C5542] hover:bg-[#5C2D14]/10">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-[#7C5542]/50 hover:text-red-500 transition-colors" title="Remove item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setCurrentScreen('catalog')} className="text-xs font-bold text-[#7C5542] hover:text-[#1A0A04] flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /><span>Add More Cakes</span>
            </button>
            <button onClick={clearCart} className="text-xs text-red-500 hover:underline font-semibold">Clear Cart</button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#1A0A04] border-b border-[#5C2D14]/15 pb-3">Order Breakdown</h2>
          <div className="space-y-2.5 text-xs text-[#7C5542]">
            <div className="flex justify-between"><span>Items Total ({cart.reduce((s, i) => s + i.qty, 0)} cakes)</span><span className="font-semibold text-[#1A0A04]">&#8377;{itemsTotal}</span></div>
            <div className="flex justify-between">
              <div className="space-y-0.5"><span>Campus Delivery / Handling</span><span className="block text-[10px] text-[#7C5542]/60">Fixed flat per order</span></div>
              <span className="font-semibold text-[#1A0A04]">&#8377;{deliveryCharge}</span>
            </div>
            <div className="pt-3 border-t border-[#5C2D14]/15 flex justify-between items-baseline font-bold text-sm text-[#1A0A04]">
              <span>Grand Total</span>
              <span className="text-xl text-[#5C2D14] font-black">&#8377;{grandTotal}</span>
            </div>
          </div>
          <div className="bg-[#F5EDE4] p-3.5 rounded-xl border border-[#5C2D14]/15 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1A0A04]"><MapPin className="w-3.5 h-3.5 text-[#5C2D14]" /><span>Fixed Pickup Point</span></div>
            <p className="text-[11px] text-[#7C5542] leading-relaxed">All orders are prepared fresh for collection at <strong>CakeCampus Point</strong>.</p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7C5542]"><Clock className="w-3 h-3 text-[#5C2D14]" /><span>Cutoff: Order by 6:00 PM previous day</span></div>
          </div>
          <button
            onClick={() => setCurrentScreen('checkout')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-black text-sm shadow-lg shadow-[#5C2D14]/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#7C5542]/40"
          >
            <span>Proceed to Checkout</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
