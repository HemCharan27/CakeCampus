import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Cake, ShoppingBag, SearchCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, cart } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#F3EAE3] px-3 py-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => setCurrentScreen('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentScreen === 'home' ? 'text-rose-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      <button
        onClick={() => setCurrentScreen('catalog')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentScreen === 'catalog' || currentScreen === 'cake-detail' ? 'text-rose-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
        }`}
      >
        <Cake className="w-5 h-5" />
        <span className="text-[10px]">Menu</span>
      </button>

      <button
        onClick={() => setCurrentScreen('cart')}
        className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          currentScreen === 'cart' ? 'text-rose-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>
        <span className="text-[10px]">Cart</span>
      </button>
    </nav>
  );
};
