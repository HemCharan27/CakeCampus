import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Sparkles, ArrowRight, ChevronRight, Cake } from 'lucide-react';
import { motion } from 'motion/react';

const DripDrop: React.FC<{ delay?: string; left?: string; color?: string }> = ({
  delay = '0s', left = '50%', color = '#5C2D14'
}) => (
  <div className="absolute pointer-events-none" style={{ left, top: '-8px' }}>
    <div
      className="drip-anim w-2.5 rounded-full opacity-80"
      style={{
        height: '28px',
        background: `linear-gradient(to bottom, ${color}CC, ${color}22)`,
        borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
        animationDelay: delay,
      }}
    />
  </div>
);

export const HomeScreen: React.FC = () => {
  const { setCurrentScreen, cakes, setSelectedCake } = useApp();

  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A0A04] via-[#23120B] to-[#2D160D] pt-10 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 text-amber-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5C2D14]/8 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-amber-800/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5C2D14]/15 backdrop-blur-md border border-[#5C2D14]/40 text-[#7C5542] text-xs font-bold tracking-wide shadow-lg brown-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Campus Artisanal Bakery Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-serif leading-[1.1] text-balance">
              <span className="text-amber-50">Freshly Baked</span>{' '}
              <span className="text-brown-gradient">Artisanal Cakes,</span>
              <br />
              <span className="text-amber-100/90">Delivered to Campus.</span>
            </h1>

            <p className="text-base sm:text-lg text-amber-200/75 max-w-2xl leading-relaxed">
              Handcrafted bakery treats pre-ordered online and ready for fast, hassle-free pickup at{' '}
              <strong className="text-[#7C5542]">CakeCampus Point</strong>.
            </p>

            <div className="pt-1 w-full sm:w-auto">
              <button
                onClick={() => setCurrentScreen('catalog')}
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r -white font-extrabold text-base shadow-xl shadow-[#5C2D14]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group cursor-pointer border border-[#7C5542]/60"
              >
                <Cake className="w-5 h-5" />
                <span>Explore Bakery Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-2 bg-[#1A0A04]/90 backdrop-blur-md rounded-2xl p-4 border border-[#5C2D14]/30 shadow-lg max-w-xl text-left w-full">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#5C2D14]/20 text-[#7C5542] flex items-center justify-center shrink-0 mt-0.5 border border-[#5C2D14]/30">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#7C5542] uppercase tracking-wider">Daily Pre-Order Cutoff: 6:00 PM IST</span>
                    <span className="text-[10px] bg-[#5C2D14]/20 text-[#7C5542] font-bold px-2 py-0.5 rounded-full border border-[#5C2D14]/30">Campus Rule</span>
                  </div>
                  <p className="text-xs text-amber-200/60 leading-normal">
                    Orders close at 6 PM for next-day pickup at <strong className="text-amber-100">CakeCampus Point</strong>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#5C2D14]/25 to-amber-900/10 blur-2xl scale-105 -z-10" />
            <div className="hero-float relative rounded-3xl overflow-hidden shadow-2xl shadow-black/70 border-2 border-[#5C2D14]/30 group">
              <img
                src="/hero_cake.jpg"
                alt="Chocolate cake slice pulled in slow-motion with ganache dripping"
                className="w-full h-[340px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A04]/80 via-[#1A0A04]/5 to-transparent" />
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <DripDrop delay="0s"   left="28%" color="#5C2D14" />
                <DripDrop delay="0.8s" left="52%" color="#7B3A08" />
                <DripDrop delay="1.5s" left="72%" color="#5C2D14" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-[#1A0A04]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#5C2D14]/30 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C2D14]/20 text-[#7C5542] flex items-center justify-center text-lg border border-[#5C2D14]/30">🎂</div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-100">Handcrafted Daily</h4>
                    <p className="text-[11px] text-[#5C2D14]/80">Pure Chocolate Ganache &amp; Cream</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold bg-gradient-to-r -white px-2.5 py-1 rounded-lg shadow-md">Fresh 100%</span>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-gradient-to-br -white flex flex-col items-center justify-center shadow-lg border-2 border-[#7C5542]/60 text-center">
              <span className="text-[8px] font-black leading-none">SLOW</span>
              <span className="text-[8px] font-black leading-none">MO</span>
              <span className="text-[9px] leading-none mt-0.5">🎬</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Cakes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-[#1A0A04] font-serif tracking-tight">
              Campus Favorites <span className="text-brown-gradient">✨</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#7C5542]">Handcrafted artisanal cakes &amp; fresh bakery biscuits</p>
          </div>
          <button
            onClick={() => setCurrentScreen('catalog')}
            className="text-xs sm:text-sm font-bold text-[#5C2D14] hover:text-[#7C5542] flex items-center gap-1 cursor-pointer bg-[#23120B] px-3.5 py-2 rounded-xl border border-[#5C2D14]/30 transition-colors shadow-sm"
          >
            View All ({cakes.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cakes.slice(0, 6).map((item) => {
            const minPrice = Math.min(...item.weights.map(w => w.price));
            const minWeightKey = item.weights[0]?.key || '';
            const isCake = (item.itemType || 'cake') === 'cake';
            return (
              <motion.div
                key={item.id || item._id}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => { setSelectedCake(item); setCurrentScreen('cake-detail'); }}
                className="bg-[#FFF8EE] rounded-2xl overflow-hidden border border-[#5C2D14]/20 shadow-sm hover:shadow-xl hover:shadow-[#5C2D14]/10 transition-all group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#F5EDE4]">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-[#1A0A04]/90 text-[#7C5542] text-[10px] font-bold px-3 py-1 rounded-full border border-[#5C2D14]/30">
                      {item.category}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-gradient-to-r -white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    From &#8377;{minPrice} ({minWeightKey})
                  </span>
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#1A0A04] text-base group-hover:text-[#5C2D14] transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-[#7C5542] line-clamp-2 leading-relaxed mt-1">{item.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#5C2D14]/15 flex items-center justify-between text-xs">
                    <span className="text-[#7C5542] font-medium">{item.weights.length} sizes &bull; {item.flavours.length} {isCake ? 'flavours' : 'varieties'}</span>
                    <span className="font-bold text-[#5C2D14] group-hover:translate-x-0.5 transition-transform">Select Options &rarr;</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-[#1A0A04] via-[#23120B] to-[#2D160D] border border-[#5C2D14]/20 rounded-3xl p-6 sm:p-10 text-center space-y-8 text-amber-50 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl font-black text-brown-gradient font-serif">How Pre-Ordering Works</h2>
            <p className="text-xs sm:text-sm text-amber-200/60">Simple 3-step pickup process for students &amp; faculty</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { n: '1', title: 'Choose Cake & Add-ons', desc: 'Select size, flavour, toppings, candles, and optional custom message.' },
              { n: '2', title: 'Order Before 6 PM', desc: 'Place your order by 6:00 PM the day before pickup. Pay by UPI and submit your UTR.' },
              { n: '3', title: 'Pick Up on Campus', desc: 'Show your Order ID at CakeCampus Point on your chosen date to collect your box!' },
            ].map(s => (
              <div key={s.n} className="bg-[#2D160D]/80 p-6 rounded-2xl border border-[#5C2D14]/20 shadow-md space-y-2.5 hover:border-[#5C2D14]/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br -white font-black flex items-center justify-center text-sm shadow-md">{s.n}</div>
                <h3 className="font-bold text-sm text-amber-100">{s.title}</h3>
                <p className="text-xs text-amber-200/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
