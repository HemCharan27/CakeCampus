import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Cake, ShoppingBag, PackageCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, cart } = useApp();

  const items: Array<{ key: string; icon: any; label: string; badge?: number }> = [
    { key: 'home',    icon: Home,         label: 'Home' },
    { key: 'catalog', icon: Cake,         label: 'Menu' },
    { key: 'cart',    icon: ShoppingBag,  label: 'Cart',   badge: cart.length },
    { key: 'track',   icon: PackageCheck, label: 'Orders' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A0A04]/96 backdrop-blur-md border-t border-[#5C2D14]/15 px-2 py-2 flex items-center justify-around shadow-2xl shadow-black/50">
      {items.map(({ key, icon: Icon, label, badge }) => {
        const active = currentScreen === key || (key === 'catalog' && currentScreen === 'cake-detail');
        return (
          <button
            key={key}
            onClick={() => setCurrentScreen(key as any)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${active ? 'text-[#7C5542]' : 'text-amber-200/50 hover:text-amber-100'}`}
          >
            <div className="relative">
              <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-[#5C2D14]/20' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-gradient-to-br from-[#5C2D14] to-[#3B1C0D] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${active ? 'text-[#7C5542]' : ''}`}>{label}</span>
            {active && <div className="w-1 h-1 rounded-full bg-[#5C2D14] mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
};

