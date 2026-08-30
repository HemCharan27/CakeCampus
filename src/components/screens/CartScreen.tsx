import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    itemsTotal, 
    deliveryCharge, 
    grandTotal, 
    setCurrentScreen 
  } = useApp();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[#2A050F] font-serif">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Choose your favorite cake from our campus catalog and customize size, flavours & toppings.
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Browse Cake Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Header & Limits */}
      <div className="flex items-center justify-between border-b border-[#F3EAE3] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#2A050F] font-serif">
            Your Cake Pre-Order Cart
          </h1>
          <p className="text-xs text-zinc-500">
            Review your customized cake items before proceeding to checkout
          </p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            <span>{cart.length} / 3 Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-[#F3EAE3] shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
            >
              {/* Left: Image & details */}
              <div className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-[#F3EAE3]">
                  <img
                    src={item.image}
                    alt={item.cakeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#2A050F] text-sm sm:text-base">
                    {item.cakeName}
                  </h3>
                  <div className="flex flex-wrap gap-1 text-[11px] text-zinc-600">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded-md font-medium text-zinc-800">
                      {item.weightKey} (₹{item.weightPrice})
                    </span>
                    <span className="bg-rose-50 px-2 py-0.5 rounded-md font-medium text-rose-800">
                      {item.flavourKey} {item.flavourExtra > 0 && `(+₹${item.flavourExtra})`}
                    </span>
                  </div>

                  {/* Toppings & Add-ons */}
                  {item.toppingKeys?.length > 0 && (
                    <p className="text-[11px] text-zinc-500">
                      <strong>Toppings:</strong> {item.toppingKeys.join(', ')} (+₹{item.toppingsExtra})
                    </p>
                  )}
                  {item.addOnKeys?.length > 0 && (
                    <p className="text-[11px] text-zinc-500">
                      <strong>Add-ons:</strong> {item.addOnKeys.join(', ')} (+₹{item.addOnsExtra})
                    </p>
                  )}
                  <p className="text-xs text-zinc-400">
                    Unit Price: ₹{item.unitPrice}
                  </p>
                </div>
              </div>

              {/* Right: Quantity controls & Line total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                <div className="text-right">
                  <span className="text-base font-bold text-rose-600">₹{item.lineTotal}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#FAF7F5] border border-[#E8DED6] rounded-xl p-1">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#2A050F] w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentScreen('catalog')}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add More Cakes</span>
            </button>
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-[#2A050F] border-b border-[#F3EAE3] pb-3">
            Order Breakdown
          </h2>

          <div className="space-y-2.5 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Items Total ({cart.reduce((s, i) => s + i.qty, 0)} cakes)</span>
              <span className="font-semibold text-zinc-900">₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between">
              <div className="space-y-0.5">
                <span>Campus Delivery / Handling</span>
                <span className="block text-[10px] text-zinc-400">Fixed flat per order</span>
              </div>
              <span className="font-semibold text-zinc-900">₹{deliveryCharge}</span>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline font-bold text-sm text-[#2A050F]">
              <span>Grand Total</span>
              <span className="text-xl text-rose-600 font-black">₹{grandTotal}</span>
            </div>
          </div>

          {/* Campus Pickup Reminder */}
          <div className="bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8DED6] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Fixed Pickup Point</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All orders are prepared fresh for collection at <strong>CakeCampus Point</strong>.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <Clock className="w-3 h-3 text-rose-600" />
              <span>Cutoff: Order by 6:00 PM previous day</span>
            </div>
          </div>

          {/* Proceed to Checkout CTA */}
          <button
            onClick={() => setCurrentScreen('checkout')}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
