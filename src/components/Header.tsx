import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Cake, 
  User, 
  LogOut, 
  PackageCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentScreen, 
    setCurrentScreen, 
    cart,
    customerUser,
    selectedCollege,
    logoutCustomer,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    customerOrders
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F3EAE3] shadow-xs">
      {/* Top micro-announcement bar */}
      <div className="bg-[#2A050F] text-rose-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>Pre-order Cutoff: Order before <strong>6:00 PM</strong> previous day</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-400 inline" /> Pickup: <strong>{selectedCollege?.pickupPoint || 'CakeCampus Point'}</strong>
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => setCurrentScreen('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#2A050F] block font-serif">
              Cake<span className="text-rose-600">Campus</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase block -mt-1">
              College Cake Pre-Orders
            </span>
          </div>
        </button>

        {/* Selected Campus Pill & Switcher */}
        {selectedCollege && (
          <button
            onClick={() => setCurrentScreen('college-select')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-950 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
            title="Click to switch campus"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{selectedCollege.name}</span>
            <span className="text-[10px] font-normal text-rose-600 underline ml-0.5 hidden sm:inline">Change</span>
          </button>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FAF7F5] p-1 rounded-full border border-[#F3EAE3]">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentScreen === 'home' 
                ? 'bg-white text-rose-700 shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentScreen('catalog')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentScreen === 'catalog' || currentScreen === 'cake-detail'
                ? 'bg-white text-rose-700 shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Bakery Menu
          </button>
        </nav>

        {/* Right Actions: Auth + Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Auth Button / Profile Menu */}
          {customerUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-[#FAF7F5] hover:bg-zinc-100 border border-[#E8DED6] transition-all cursor-pointer"
              >
                {customerUser.avatarUrl ? (
                  <img
                    src={customerUser.avatarUrl}
                    alt={customerUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-rose-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    {customerUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-[#2A050F] max-w-[100px] truncate">
                  {customerUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#F3EAE3] shadow-xl p-2 space-y-1 z-50 animate-fade-in"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 mb-1">
                    <p className="text-xs font-bold text-[#2A050F] truncate">{customerUser.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{customerUser.email}</p>
                    {selectedCollege && (
                      <p className="text-[10px] text-rose-700 font-medium truncate mt-1">
                        🏫 {selectedCollege.name}
                      </p>
                    )}
                    {customerUser.rollNumber && (
                      <span className="text-[10px] font-mono bg-white text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                        Roll: {customerUser.rollNumber}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentScreen('college-select');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Switch Campus</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen('track');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>My Orders ({customerOrders.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutCustomer();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#E8DED6] text-xs font-bold text-zinc-800 shadow-2xs transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart CTA */}
          <button
            onClick={() => setCurrentScreen('cart')}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200/60 font-semibold text-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
