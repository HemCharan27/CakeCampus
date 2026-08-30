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

  // Reset window scroll position to top whenever screen changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentScreen]);

  // 1. If viewing Admin Portal, render dedicated standalone Admin Layout
  if (currentScreen === 'admin') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2A050F] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
        <AdminScreen />
      </div>
    );
  }

  // 2. Gate 1: Mandatory Sign-In First
  // If user is not authenticated, show the Sign-In page directly
  if (!customerToken && !customerUser) {
    return <SignInScreen />;
  }

  // 3. Gate 2: Mandatory Campus / College Selection
  // If user is authenticated but has not selected a college yet (or wants to switch), show College Selection Screen
  if ((!selectedCollege && !customerUser?.college) || currentScreen === 'college-select') {
    return <CollegeSelectScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'catalog':
        return <CakesCatalogScreen />;
      case 'cake-detail':
        return <CakeDetailScreen />;
      case 'cart':
        return <CartScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'track':
        return <OrderTrackScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#2A050F] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      <Header />
      <main className="flex-1">
        {renderScreen()}
      </main>
      <BottomNav />

      {/* Root-Level Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Customer Footer */}
      <footer className="bg-white border-t border-[#F3EAE3] py-8 text-center text-xs text-zinc-500 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-zinc-700">
            CakeCampus • College Cake Pre-Order Portal
          </p>
          <p className="text-[11px] text-zinc-400">
            Fixed Campus Pickup at CakeCampus Point • Pre-orders cutoff at 6:00 PM IST previous day
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
