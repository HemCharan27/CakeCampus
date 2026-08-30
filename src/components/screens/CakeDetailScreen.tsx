import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const CakeDetailScreen: React.FC = () => {
  const { selectedCake, setCurrentScreen, addToCart, cart, formatPrice } = useApp();

  if (!selectedCake) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-zinc-500">No item selected</p>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
        >
          Back to Bakery Menu
        </button>
      </div>
    );
  }

  // Selections
  const [selectedWeightKey, setSelectedWeightKey] = useState<string>(
    selectedCake.weights[0]?.key || '1kg'
  );
  const [selectedFlavourKey, setSelectedFlavourKey] = useState<string>(
    selectedCake.flavours[0]?.key || 'Chocolate'
  );
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Reset selections when cake changes
  useEffect(() => {
    if (selectedCake) {
      setSelectedWeightKey(selectedCake.weights[0]?.key || '1kg');
      setSelectedFlavourKey(selectedCake.flavours[0]?.key || 'Chocolate');
      setSelectedToppings([]);
      setSelectedAddOns([]);
      setQty(1);
      setActiveImageIndex(0);
      setToastMessage(null);
    }
  }, [selectedCake?.id]);

  // Live Price Calculation
  const selectedWeight = selectedCake.weights.find(w => w.key === selectedWeightKey) || selectedCake.weights[0];
  const weightPrice = selectedWeight?.price || 0;

  const selectedFlavour = selectedCake.flavours.find(f => f.key === selectedFlavourKey) || selectedCake.flavours[0];
  const flavourExtra = selectedFlavour?.extra || 0;

  const toppingsExtra = selectedToppings.reduce((sum, key) => {
    const top = selectedCake.toppings.find(t => t.key === key);
    return sum + (top?.extra || 0);
  }, 0);

  const addOnsExtra = selectedAddOns.reduce((sum, key) => {
    const add = selectedCake.addOns.find(a => a.key === key);
    return sum + (add?.extra || 0);
  }, 0);

  const unitPrice = weightPrice + flavourExtra + toppingsExtra + addOnsExtra;
  const lineTotal = unitPrice * qty;

  const toggleTopping = (key: string) => {
    setSelectedToppings(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleAddOn = (key: string) => {
    setSelectedAddOns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleAddToCart = () => {
    const res = addToCart({
      cakeId: String(selectedCake._id || selectedCake.id),
      cakeName: selectedCake.name,
      image: selectedCake.images[0] || '',
      weightKey: selectedWeightKey,
      weightPrice,
      flavourKey: selectedFlavourKey,
      flavourExtra,
      toppingKeys: selectedToppings,
      toppingsExtra,
      addOnKeys: selectedAddOns,
      addOnsExtra,
      unitPrice,
      qty,
    });

    if (res.success) {
      setToastMessage({ 
        text: res.message || `Added ${qty}x ${selectedCake.name} (${selectedWeightKey}) to cart!`,
        type: 'success' 
      });
    } else {
      setToastMessage({ 
        text: res.message || 'Cart limit exceeded.', 
        type: 'error' 
      });
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const isCake = (selectedCake.itemType || 'cake') === 'cake';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Back button */}
      <button
        onClick={() => setCurrentScreen('catalog')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {isCake ? 'Cakes Menu' : 'Biscuits Menu'}</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-md animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          {toastMessage.type === 'success' && (
            <button
              onClick={() => setCurrentScreen('cart')}
              className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
            >
              View Cart &rarr;
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Images & Info */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 border border-[#F3EAE3] shadow-xs">
            <img
              src={selectedCake.images[activeImageIndex] || selectedCake.images[0]}
              alt={selectedCake.name}
              className="w-full h-full object-cover"
            />
            {selectedCake.category && (
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#2A050F] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {selectedCake.category}
              </span>
            )}
          </div>

          {/* Thumbnail strip if multiple images */}
          {selectedCake.images.length > 1 && (
            <div className="flex gap-2">
              {selectedCake.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-rose-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Campus Notes */}
          <div className="bg-white p-5 rounded-2xl border border-[#F3EAE3] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                {isCake ? 'Artisanal Cake' : 'Bakery Biscuit'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2A050F] font-serif">
              {selectedCake.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {selectedCake.description}
            </p>

            <div className="pt-3 border-t border-[#FAF7F5] flex flex-col gap-1.5 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Cutoff: Order by <strong>6:00 PM previous day</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Pickup: <strong>CakeCampus Point</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Customization Options */}
        <div className="bg-white p-6 rounded-3xl border border-[#F3EAE3] shadow-xs space-y-6">
          <h2 className="text-base font-black text-[#2A050F] border-b border-[#F3EAE3] pb-3">
            Customize Your Pre-Order
          </h2>

          {/* 1. Weight / Pack Size Selection (Required) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
                1. Select {isCake ? 'Weight' : 'Pack Size'} <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-medium">Required</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {selectedCake.weights.map((w) => {
                const isSelected = selectedWeightKey === w.key;
                return (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => setSelectedWeightKey(w.key)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs'
                        : 'border-[#E8DED6] bg-[#FAF7F5] text-zinc-700 hover:bg-zinc-100 font-medium'
                    }`}
                  >
                    <div className="text-xs font-bold">{w.key}</div>
                    <div className="text-[11px] text-rose-600 font-semibold mt-0.5">₹{w.price}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Flavour / Variety Selection (Required) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
                2. Select {isCake ? 'Flavour' : 'Variety'} <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-medium">Required</span>
            </div>
            <div className="space-y-2">
              {selectedCake.flavours.map((f) => {
                const isSelected = selectedFlavourKey === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFlavourKey(f.key)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs'
                        : 'border-[#E8DED6] bg-[#FAF7F5] text-zinc-700 hover:bg-zinc-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-zinc-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{f.key}</span>
                    </div>
                    <span className="text-zinc-500 font-semibold">
                      {f.extra > 0 ? `+₹${f.extra}` : 'Included'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Toppings Selection (Optional, Multiple) */}
          {selectedCake.toppings.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
                  3. Extra {isCake ? 'Toppings' : 'Garnishes'}
                </label>
                <span className="text-[11px] text-zinc-400 font-medium">Optional • Multiple</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedCake.toppings.map((t) => {
                  const isSelected = selectedToppings.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTopping(t.key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs'
                          : 'border-[#E8DED6] bg-[#FAF7F5] text-zinc-700 hover:bg-zinc-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-zinc-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{t.key}</span>
                      </div>
                      <span className="text-zinc-500 font-semibold shrink-0 ml-1">
                        +₹{t.extra}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Add-Ons Selection (Optional, Multiple) */}
          {selectedCake.addOns.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2A050F] uppercase tracking-wide">
                  4. {isCake ? 'Celebration Add-ons' : 'Gifting & Add-ons'}
                </label>
                <span className="text-[11px] text-zinc-400 font-medium">Optional</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedCake.addOns.map((a) => {
                  const isSelected = selectedAddOns.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => toggleAddOn(a.key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs'
                          : 'border-[#E8DED6] bg-[#FAF7F5] text-zinc-700 hover:bg-zinc-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-zinc-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{a.key}</span>
                      </div>
                      <span className="text-zinc-500 font-semibold shrink-0 ml-1">
                        +₹{a.extra}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Quantity & Price Breakdown */}
          <div className="pt-4 border-t border-[#F3EAE3] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2A050F]">Quantity</span>
              <div className="flex items-center gap-3 bg-[#FAF7F5] border border-[#E8DED6] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#2A050F] w-6 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(q => q + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Price breakdown pill */}
            <div className="bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8DED6] space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Unit Price ({selectedWeightKey})</span>
                <span>₹{unitPrice}</span>
              </div>
              {(flavourExtra > 0 || toppingsExtra > 0 || addOnsExtra > 0) && (
                <div className="text-[11px] text-zinc-400">
                  Base: ₹{weightPrice} {flavourExtra > 0 && `+ Flavour: ₹${flavourExtra}`} {toppingsExtra > 0 && `+ Toppings: ₹${toppingsExtra}`} {addOnOnsExtra(addOnsExtra)}
                </div>
              )}
              <div className="flex justify-between font-bold text-[#2A050F] pt-1 border-t border-zinc-200">
                <span>Total for {qty} item{qty > 1 ? 's' : ''}</span>
                <span className="text-base text-rose-600 font-extrabold">₹{lineTotal}</span>
              </div>
            </div>

            {/* Cart limit indicator */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Cart items used: <strong>{cart.length}/3</strong></span>
              {cart.length >= 3 && (
                <span className="text-amber-600 font-semibold">Max 3 line items limit</span>
              )}
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart • ₹{lineTotal}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const addOnOnsExtra = (val: number) => {
  return val > 0 ? `+ Add-ons: ₹${val}` : '';
};
