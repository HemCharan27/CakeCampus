import React from 'react';
import { useApp } from '../../context/AppContext';
import { Cake, Sparkles, MapPin, Clock, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1A0A04] via-[#23120B] to-[#2D160D] p-8 sm:p-12 rounded-3xl border border-[#5C2D14]/25 shadow-2xl text-center space-y-4 text-amber-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5C2D14]/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-[#5C2D14] text-[#1A0A04] flex items-center justify-center mx-auto shadow-lg shadow-[#5C2D14]/30 font-black relative z-10">
          <Cake className="w-9 h-9" />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C2D14]/15 border border-[#5C2D14]/30 text-[#7C5542] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Campus Bakery Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-amber-100">
            About Cake<span className="text-brown-gradient">Campus</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/75 max-w-xl mx-auto leading-relaxed">
            Freshly baked artisanal cakes, pastries, and handcrafted bakery biscuits — prepared with love and delivered directly to your campus pickup point.
          </p>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
            <Heart className="w-5 h-5 text-[#5C2D14]" />
          </div>
          <h3 className="font-bold text-[#1A0A04] text-base font-serif">Handcrafted Quality</h3>
          <p className="text-xs text-[#7C5542] leading-relaxed">
            Every cake is baked fresh using premium ingredients, rich chocolate ganache, and authentic cream recipes tailored for student celebrations.
          </p>
        </div>

        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
            <MapPin className="w-5 h-5 text-[#5C2D14]" />
          </div>
          <h3 className="font-bold text-[#1A0A04] text-base font-serif">Fixed Campus Pickup</h3>
          <p className="text-xs text-[#7C5542] leading-relaxed">
            No long delivery waits or address confusion. Collect your fresh cake order conveniently at <strong>CakeCampus Point</strong> inside your campus.
          </p>
        </div>

        <div className="bg-[#FFF8EE] p-6 rounded-3xl border border-[#5C2D14]/20 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#23120B] text-[#7C5542] flex items-center justify-center border border-[#5C2D14]/30">
            <Clock className="w-5 h-5 text-[#5C2D14]" />
          </div>
          <h3 className="font-bold text-[#1A0A04] text-base font-serif">Scheduled Pre-Orders</h3>
          <p className="text-xs text-[#7C5542] leading-relaxed">
            Order by <strong>6:00 PM IST</strong> the day before your celebration to guarantee next-day morning baking and timely afternoon pickup.
          </p>
        </div>
      </div>

      {/* Info Placeholder Banner */}
      <div className="bg-[#F5EDE4] p-6 rounded-3xl border border-[#5C2D14]/25 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5C2D14]/15 text-[#5C2D14] text-xs font-bold border border-[#5C2D14]/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Information Notice</span>
        </div>
        <p className="text-xs text-[#7C5542] max-w-lg mx-auto leading-relaxed font-medium">
          Detailed company background, bakery partner stories, and team information will be updated soon.
        </p>
        <button
          onClick={() => setCurrentScreen('catalog')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r -white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
        >
          <span>Browse Bakery Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
