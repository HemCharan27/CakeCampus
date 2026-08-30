import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Sparkles, Filter, Cake, Cookie, Clock, MapPin, ArrowRight, Layers } from 'lucide-react';

const CAKE_CATEGORIES = ['All', 'Fruit Pastries', 'Chocolate', 'Classic', 'Premium', 'Specialty'];
const BISCUIT_CATEGORIES = ['All', 'Butter', 'Chocolate', 'Nutty', 'Traditional', 'Healthy'];

export const CakesCatalogScreen: React.FC = () => {
  const {
    cakes,
    isLoadingCakes,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setSelectedCake,
    setCurrentScreen,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'cakes' | 'biscuits'>('cakes');

  // Count items
  const cakeCount = cakes.filter(c => (c.itemType || 'cake') === 'cake').length;
  const biscuitCount = cakes.filter(c => c.itemType === 'biscuit').length;

  const currentCategories = activeSection === 'cakes' ? CAKE_CATEGORIES : BISCUIT_CATEGORIES;

  // Filter items
  const filteredItems = cakes.filter(item => {
    const isSectionMatch = activeSection === 'cakes' 
      ? (item.itemType || 'cake') === 'cake' 
      : item.itemType === 'biscuit';

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'All' || 
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

    return isSectionMatch && matchesSearch && matchesCategory;
  });

  const handleSectionSwitch = (section: 'cakes' | 'biscuits') => {
    setActiveSection(section);
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2A050F] font-serif">
            Campus Bakery Menu
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Freshly baked artisanal cakes & handcrafted bakery biscuits for campus pickup
          </p>
        </div>

        {/* Quick reminder badge */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-rose-800 self-start md:self-auto">
          <Clock className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Cutoff: Order by <strong>6 PM</strong> previous day</span>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#FAF7F5] p-1.5 rounded-2xl border border-[#E8DED6]">
        <button
          onClick={() => handleSectionSwitch('cakes')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'cakes'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
          }`}
        >
          <Cake className="w-4 h-4 shrink-0" />
          <span>Artisanal Cakes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeSection === 'cakes' ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-zinc-700'
          }`}>
            {cakeCount}
          </span>
        </button>

        <button
          onClick={() => handleSectionSwitch('biscuits')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'biscuits'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
          }`}
        >
          <Cookie className="w-4 h-4 shrink-0" />
          <span>Fresh Biscuits & Cookies</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeSection === 'biscuits' ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-zinc-700'
          }`}>
            {biscuitCount}
          </span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSection === 'cakes'
                ? 'Search pineapple pastry, black forest, red velvet, truffle...'
                : 'Search butter shortbread, choco-chip cookies, almond biscotti...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs sm:text-sm text-[#2A050F] placeholder-zinc-400 shadow-xs"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {currentCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-[#E8DED6] hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section Sub-heading */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-800">
            {activeSection === 'cakes' ? '🎂 Available Cakes' : '🍪 Available Biscuits & Cookies'}
          </span>
          <span className="text-xs text-zinc-400">
            ({filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingCakes ? (
        <div className="py-20 text-center space-y-3">
          <Cake className="w-8 h-8 text-rose-500 animate-bounce mx-auto" />
          <p className="text-xs text-zinc-500">Loading fresh bakery treats...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#F3EAE3] p-8 space-y-3">
          <p className="text-sm font-bold text-zinc-700">No items found matching your filter</p>
          <p className="text-xs text-zinc-500">Try changing your search term or category filter</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const minWeightPrice = Math.min(...item.weights.map(w => w.price));
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
                    loading="lazy"
                  />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#2A050F] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {item.category}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-[#2A050F]/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                    From ₹{minWeightPrice} ({minWeightKey})
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-[#2A050F] text-base group-hover:text-rose-600 transition-colors leading-snug">
                        {item.name}
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Weights & Options preview */}
                  <div className="pt-2 border-t border-[#FAF7F5] space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {item.weights.map(w => (
                        <span key={w.key} className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                          {w.key}: ₹{w.price}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-zinc-500">
                        {item.flavours.length} {isCake ? 'flavours' : 'varieties'} • {item.addOns.length} add-ons
                      </span>
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Customize & Order <ArrowRight className="w-3.5 h-3.5" />
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

