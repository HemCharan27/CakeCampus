import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Cake, Cookie, Clock, ArrowRight } from 'lucide-react';

const CAKE_CATS = ['All', 'Fruit Pastries', 'Chocolate', 'Classic', 'Premium', 'Specialty'];
const BISC_CATS = ['All', 'Butter', 'Chocolate', 'Nutty', 'Traditional', 'Healthy'];

export const CakesCatalogScreen: React.FC = () => {
  const { cakes, isLoadingCakes, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, setSelectedCake, setCurrentScreen } = useApp();
  const [activeSection, setActiveSection] = useState<'cakes' | 'biscuits'>('cakes');

  const cakeCount = cakes.filter(c => (c.itemType || 'cake') === 'cake').length;
  const biscuitCount = cakes.filter(c => c.itemType === 'biscuit').length;
  const currentCats = activeSection === 'cakes' ? CAKE_CATS : BISC_CATS;

  const filteredItems = cakes.filter(item => {
    const sectionMatch = activeSection === 'cakes' ? (item.itemType || 'cake') === 'cake' : item.itemType === 'biscuit';
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()) || (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const catMatch = selectedCategory === 'All' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return sectionMatch && searchMatch && catMatch;
  });

  const handleSectionSwitch = (s: 'cakes' | 'biscuits') => { setActiveSection(s); setSelectedCategory('All'); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A0A04] font-serif">Campus Bakery Menu</h1>
          <p className="text-xs sm:text-sm text-[#7C5542]">Freshly baked artisanal cakes &amp; handcrafted bakery biscuits for campus pickup</p>
        </div>
        <div className="bg-[#23120B] border border-[#5C2D14]/30 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-[#7C5542] self-start md:self-auto shadow-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Cutoff: Order by <strong>6 PM</strong> previous day</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#1A0A04] p-1.5 rounded-2xl border border-[#5C2D14]/20">
        {(['cakes', 'biscuits'] as const).map(s => (
          <button
            key={s}
            onClick={() => handleSectionSwitch(s)}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === s
                ? 'bg-gradient-to-r -white shadow-md font-extrabold'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2D160D]'
            }`}
          >
            {s === 'cakes' ? <Cake className="w-4 h-4 shrink-0" /> : <Cookie className="w-4 h-4 shrink-0" />}
            <span>{s === 'cakes' ? 'Artisanal Cakes' : 'Fresh Biscuits & Cookies'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSection === s ? 'bg-[#1A0A04]/30 text-[#1A0A04]' : 'bg-[#5C2D14]/20 text-[#7C5542]'}`}>
              {s === 'cakes' ? cakeCount : biscuitCount}
            </span>
          </button>
        ))}
      </div>

      {/* Search + category filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7C5542] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeSection === 'cakes' ? 'Search pineapple pastry, black forest, red velvet...' : 'Search butter shortbread, choco-chip cookies...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#5C2D14]/25 focus:border-[#5C2D14] focus:outline-none text-xs sm:text-sm text-[#1A0A04] placeholder-[#7C5542]/60 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {currentCats.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-gradient-to-r -white font-bold shadow-sm'
                  : 'bg-[#FFF8EE] text-[#7C5542] border border-[#5C2D14]/20 hover:bg-[#5C2D14]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-heading */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-bold text-[#1A0A04]">
          {activeSection === 'cakes' ? '🎂 Available Cakes' : '🍪 Available Biscuits & Cookies'}
        </span>
        <span className="text-xs text-[#7C5542]">({filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''})</span>
      </div>

      {/* Loading */}
      {isLoadingCakes ? (
        <div className="py-20 text-center space-y-3">
          <Cake className="w-8 h-8 text-[#5C2D14] animate-bounce mx-auto" />
          <p className="text-xs text-[#7C5542]">Loading fresh bakery treats...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#FFF8EE] rounded-2xl border border-[#5C2D14]/20 p-8 space-y-3">
          <p className="text-sm font-bold text-[#1A0A04]">No items found matching your filter</p>
          <p className="text-xs text-[#7C5542]">Try changing your search term or category filter</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="px-4 py-2 rounded-xl bg-[#5C2D14]/15 text-[#5C2D14] text-xs font-bold cursor-pointer hover:bg-[#5C2D14]/25 border border-[#5C2D14]/30">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const minPrice = Math.min(...item.weights.map(w => w.price));
            const minWeightKey = item.weights[0]?.key || '';
            const isCake = (item.itemType || 'cake') === 'cake';
            return (
              <div
                key={item.id || item._id}
                onClick={() => { setSelectedCake(item); setCurrentScreen('cake-detail'); }}
                className="bg-[#FFF8EE] rounded-2xl overflow-hidden border border-[#5C2D14]/20 shadow-sm hover:shadow-xl hover:shadow-[#5C2D14]/10 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#F5EDE4]">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
                  <div className="space-y-1.5">
                    <h2 className="font-bold text-[#1A0A04] text-base group-hover:text-[#5C2D14] transition-colors leading-snug">{item.name}</h2>
                    <p className="text-xs text-[#7C5542] line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#5C2D14]/15 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {item.weights.map(w => (
                        <span key={w.key} className="text-[10px] bg-[#5C2D14]/10 text-[#7C5542] border border-[#5C2D14]/20 px-2 py-0.5 rounded-md font-semibold">
                          {w.key}: &#8377;{w.price}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#7C5542]">{item.flavours.length} {isCake ? 'flavours' : 'varieties'} &bull; {item.addOns.length} add-ons</span>
                      <span className="text-xs font-bold text-[#5C2D14] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Customize &amp; Order <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
