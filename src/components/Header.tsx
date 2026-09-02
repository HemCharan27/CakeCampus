import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Clock, MapPin, Cake, User, LogOut, PackageCheck, ChevronDown, Info, MessageSquare, Shield } from 'lucide-react';
import { ScreenType } from '../types';

export const Header: React.FC = () => {
  const { currentScreen, setCurrentScreen, cart, customerUser, selectedCollege, logoutCustomer, setIsAuthModalOpen, setAuthModalMode, customerOrders } = useApp();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#1A0A04]/96 backdrop-blur-md border-b border-[#5C2D14]/15 shadow-lg text-amber-50">
      {/* Announcement bar */}
      <div className="bg-[#5C2D14]/10 text-[#7C5542] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-[#5C2D14]/15">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>Pre-order Cutoff: Order before <strong>6:00 PM</strong> previous day</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline">
          <MapPin className="w-3 h-3 inline mr-0.5" /> Pickup: <strong className="text-amber-200">{selectedCollege?.pickupPoint || 'CakeCampus Point'}</strong>
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button onClick={() => setCurrentScreen('home')} className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5C2D14] to-[#3B1C0D] text-white shadow-lg shadow-[#5C2D14]/25 group-hover:scale-105 transition-transform font-bold">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-amber-100 block font-serif">
              Cake<span className="text-brown-gradient">Campus</span>
            </span>
            <span className="text-[10px] text-[#5C2D14]/70 font-semibold tracking-wider uppercase block -mt-1">Order today, celebrate tomorrow</span>
          </div>
        </button>

        {/* Campus pill */}
        {selectedCollege && (
          <button
            onClick={() => setCurrentScreen('college-select')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5C2D14]/10 hover:bg-[#5C2D14]/20 border border-[#5C2D14]/30 text-[#7C5542] text-xs font-bold transition-all cursor-pointer shadow-sm group hidden lg:flex"
          >
            <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{selectedCollege.name}</span>
            <span className="text-[10px] font-normal text-[#5C2D14]/70 underline ml-0.5 hidden sm:inline">Change</span>
          </button>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#1A0A04] p-1 rounded-full border border-[#5C2D14]/20">
          {[
            ['home', 'Home'], 
            ['catalog', 'Bakery Menu'], 
            ['track', 'My Orders'],
            ['about', 'About Us'],
            ['contact', 'Contact Us']
          ].map(([s, label]) => (
            <button
              key={s}
              onClick={() => setCurrentScreen(s as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                (currentScreen === s || (s === 'catalog' && currentScreen === 'cake-detail'))
                  ? 'bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white font-bold shadow-sm'
                  : 'text-amber-200/70 hover:text-amber-100'
              }`}
            >{label}</button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Login Button */}
          <button
            onClick={() => setCurrentScreen('admin')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5C2D14]/10 hover:bg-[#5C2D14]/20 border border-[#5C2D14]/30 text-xs font-bold text-[#7C5542] shadow-sm transition-colors cursor-pointer mr-1"
            title="Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 hidden sm:inline" /><span>Admin</span>
          </button>

          {customerUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-[#5C2D14]/10 hover:bg-[#5C2D14]/20 border border-[#5C2D14]/30 transition-all cursor-pointer"
              >
                {customerUser.avatarUrl ? (
                  <img src={customerUser.avatarUrl} alt={customerUser.name} className="w-7 h-7 rounded-full object-cover border border-[#5C2D14]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5C2D14] to-[#3B1C0D] text-white font-black text-xs flex items-center justify-center">
                    {customerUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-amber-100 max-w-[100px] truncate">{customerUser.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5C2D14]/70 hidden sm:inline" />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#23120B] rounded-2xl border border-[#5C2D14]/25 shadow-2xl p-2 space-y-1 z-50 text-amber-100"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="p-2.5 bg-[#1A0A04] rounded-xl border border-[#5C2D14]/20 mb-1">
                    <p className="text-xs font-bold text-amber-100 truncate">{customerUser.name}</p>
                    <p className="text-[11px] text-[#5C2D14]/70 font-mono truncate">{customerUser.email}</p>
                    {selectedCollege && <p className="text-[10px] text-[#7C5542] font-medium truncate mt-1">🏫 {selectedCollege.name}</p>}
                    {customerUser.rollNumber && (
                      <span className="text-[10px] font-mono bg-[#5C2D14]/15 text-[#7C5542] font-bold px-1.5 py-0.5 rounded border border-[#5C2D14]/25 mt-1 inline-block">
                        Roll: {customerUser.rollNumber}
                      </span>
                    )}
                  </div>
                  <button onClick={() => { setCurrentScreen('college-select'); setIsProfileMenuOpen(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-200/90 hover:bg-[#2D160D] flex items-center gap-2 cursor-pointer">
                    <MapPin className="w-3.5 h-3.5 text-[#5C2D14]" /><span>Switch Campus</span>
                  </button>
                  <button onClick={() => { setCurrentScreen('track'); setIsProfileMenuOpen(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-200/90 hover:bg-[#2D160D] flex items-center gap-2 cursor-pointer">
                    <PackageCheck className="w-3.5 h-3.5 text-[#5C2D14]" /><span>My Orders ({customerOrders.length})</span>
                  </button>
                  <button onClick={() => { setCurrentScreen('about'); setIsProfileMenuOpen(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-200/90 hover:bg-[#2D160D] flex items-center gap-2 cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-[#5C2D14]" /><span>About Us</span>
                  </button>
                  <button onClick={() => { setCurrentScreen('contact'); setIsProfileMenuOpen(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-200/90 hover:bg-[#2D160D] flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5 text-[#5C2D14]" /><span>Contact Us</span>
                  </button>
                  <button onClick={() => { logoutCustomer(); setIsProfileMenuOpen(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-400 hover:bg-[#3D1A16] flex items-center gap-2 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5 text-red-400" /><span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5C2D14]/10 hover:bg-[#5C2D14]/20 border border-[#5C2D14]/30 text-xs font-bold text-[#7C5542] shadow-sm transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /><span>Sign In</span>
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => setCurrentScreen('cart')}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#5C2D14] to-[#3B1C0D] text-white hover:from-[#3B1C0D] hover:to-[#5C2D14] transition-all font-bold text-xs cursor-pointer shadow-md shadow-[#5C2D14]/30"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="bg-[#1A0A04] text-[#7C5542] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-[#5C2D14]/50">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
