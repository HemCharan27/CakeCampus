import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';

import { SignInScreen } from './components/screens/SignInScreen';
import { CollegeSelectScreen } from './components/screens/CollegeSelectScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CakesCatalogScreen } from './components/screens/CakesCatalogScreen';
import { CakeDetailScreen } from './components/screens/CakeDetailScreen';
import { CartScreen } from './components/screens/CartScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { SuccessScreen } from './components/screens/SuccessScreen';
import { OrderTrackScreen } from './components/screens/OrderTrackScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { ContactScreen } from './components/screens/ContactScreen';
import { AdminScreen } from './components/screens/AdminScreen';

const AppContent: React.FC = () => {
  const {
    currentScreen,
    customerToken,
    customerUser,
    selectedCollege,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode
  } = useApp();

  // Scroll to top + trigger page-enter animation on every screen change
  const [pageKey, setPageKey] = React.useState(0);
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setPageKey(k => k + 1);
  }, [currentScreen]);

  if (currentScreen === 'admin') {
    return (
      <div className="min-h-screen bg-[#F5EDE4] text-[#1C0D08] flex flex-col font-sans selection:bg-yellow-100 selection:text-amber-900">
        <AdminScreen />
      </div>
    );
  }

  if (!customerToken && !customerUser) {
    return <SignInScreen />;
  }

  if ((!selectedCollege && !customerUser?.college) || currentScreen === 'college-select') {
    return <CollegeSelectScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':        return <HomeScreen />;
      case 'catalog':     return <CakesCatalogScreen />;
      case 'cake-detail': return <CakeDetailScreen />;
      case 'cart':        return <CartScreen />;
      case 'checkout':    return <CheckoutScreen />;
      case 'success':     return <SuccessScreen />;
      case 'track':       return <OrderTrackScreen />;
      case 'about':       return <AboutScreen />;
      case 'contact':     return <ContactScreen />;
      default:            return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDE4] text-[#1C0D08] flex flex-col font-sans selection:bg-yellow-100 selection:text-amber-950">
      <Header />
      <main key={pageKey} className="flex-1 page-enter">
        {renderScreen()}
      </main>
      <BottomNav />

      {/* Root-Level Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1A0A04] via-[#23120B] to-[#1A0A04] border-t border-[#5C2D14]/20 py-8 text-center text-xs hidden md:block">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-bold text-brown-gradient text-sm">CakeCampus &bull; Order today, celebrate tomorrow</p>
          <p className="text-[11px] text-amber-200/50">
            Fixed Campus Pickup at CakeCampus Point &bull; Pre-orders cutoff at 6:00 PM IST previous day
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
