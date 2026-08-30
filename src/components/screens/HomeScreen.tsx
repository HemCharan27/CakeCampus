import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, MapPin, Sparkles, ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2, ChevronRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { setCurrentScreen, cakes, setSelectedCake } = useApp();

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-100/70 via-[#FAF7F5] to-[#FAF7F5] pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 shadow-xs text-rose-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
            <span>Official College Cake Pre-Order Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#2A050F] tracking-tight font-serif leading-tight">
            Celebrate Birthdays & Campus Moments! 🎂🍪
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-medium">
            Pre-order freshly baked artisanal cakes & handcrafted cookies for scheduled pickup at <strong className="text-zinc-900 font-bold">CakeCampus Point</strong>.
            Pay securely by UPI QR and submit your UTR for manual verification.
          </p>

          {/* CRITICAL CUTOFF NOTICE CARD */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-rose-300/80 shadow-md max-w-xl mx-auto text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-xl -z-10" />
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#2A050F] uppercase tracking-wide">
                    Pre-Order Cutoff Rule
                  </h2>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                    Strict Policy
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  For pickup date <strong className="text-zinc-900">D</strong>, your order must be placed before{' '}
                  <strong className="text-rose-600 font-bold">6:00 PM IST on (D - 1)</strong>.
                  After 6:00 PM, next-day pickups are automatically closed so our bakers can prepare fresh.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Fixed Pickup: <strong>CakeCampus Point</strong> (Student Activity Center)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentScreen('catalog')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore Bakery Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Cakes Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2A050F] font-serif">
              Campus Favorites ✨
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Handcrafted cakes & fresh bakery biscuits with premium ingredients
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('catalog')}
            className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            View All ({cakes.length})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cakes.slice(0, 6).map((item) => {
            const minPrice = Math.min(...item.weights.map(w => w.price));
            const minWeightKey = item.weights[0]?.key || '';
            const isCake = (item.itemType || 'cake') === 'cake';

            return (
              <div
                key={item.id || item._id}
                onClick={() => {
                  setSelectedCake(item);
                  setCurrentScreen('cake-detail');
                }}
                className="bg-white rounded-2xl overflow-hidden border border-[#F3EAE3] shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#2A050F] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {item.category}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-[#2A050F]/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                    From ₹{minPrice} ({minWeightKey})
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="font-bold text-[#2A050F] text-base group-hover:text-rose-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-[#FAF7F5] flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      {item.weights.length} sizes • {item.flavours.length} {isCake ? 'flavours' : 'varieties'}
                    </span>
                    <span className="font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Select Options &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#FAF7F5] border border-[#F3EAE3] rounded-3xl p-6 sm:p-8 text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-[#2A050F] font-serif">
              How Pre-Ordering Works
            </h2>
            <p className="text-xs text-zinc-500">Simple 3-step pickup process for students & faculty</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-[#2A050F]">Choose Cake & Add-ons</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Select your preferred size, flavour, toppings, candles, and optional custom message on the cake.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-[#2A050F]">Order Before 6 PM</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Place your order by 6:00 PM on the day before pickup. Pay by UPI and submit your UTR.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-[#2A050F]">Pick Up on Campus</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Show your Order ID at CakeCampus Point on your chosen date to collect your freshly baked box!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
