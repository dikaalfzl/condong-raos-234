import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & UI
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WaveDivider from './components/ui/WaveDivider';

// Sections (Halaman Utama)
import Hero from './components/sections/Hero';
import SpecialShowcase from './components/sections/SpecialShowcase';
import MenuSection from './components/sections/MenuSection';
import TestimonialSection from './components/sections/TestimonialSection';
import MapsSection from './components/sections/MapsSection';
import ContactSection from './components/sections/ContactSection';

// Modals & Pages
import AuthModal from './components/modals/AuthModal';
import AdminDashboard from './pages/AdminDashboard';
import AllReviewsPage from './pages/AllReviewsPage';
import AllPhotosPage from './pages/AllPhotosPage';

function AppContent() {
  const { toast, isAdmin } = useAuth();
  // Pilihan state halaman: 'home' | 'login' | 'register' | 'admin' | 'all-reviews' | 'all-photos'
  const [activePage, setActivePage] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerDataRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const navigateToPage = (pageName) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActivePage(pageName);
  };

  useEffect(() => {
    if (activePage === 'admin' && !isAdmin) {
      setActivePage('home');
    }
  }, [activePage, isAdmin]);

  return (
    <div className="wavy-page-wrapper">
      {/* 1. HALAMAN LOGIN ATAU DAFTAR AKUN */}
      {(activePage === 'login' || activePage === 'register') && (
        <AuthModal
          isOpen={true}
          mode={activePage}
          onSwitchMode={(newMode) => navigateToPage(newMode)}
          onClose={() => navigateToPage('home')}
        />
      )}

      {/* 2. HALAMAN DASHBOARD ADMIN */}
      {activePage === 'admin' && isAdmin && (
        <AdminDashboard
          isOpen={true}
          onClose={() => navigateToPage('home')}
          onDataUpdated={triggerDataRefresh}
        />
      )}

      {/* 3. HALAMAN PENUH SEMUA ULASAN & FILTER KATEGORI */}
      {activePage === 'all-reviews' && (
        <AllReviewsPage onBack={() => navigateToPage('home')} />
      )}

      {/* 4. HALAMAN PENUH GALERI FOTO SUASANA */}
      {activePage === 'all-photos' && (
        <AllPhotosPage onBack={() => navigateToPage('home')} />
      )}

      {/* 5. HALAMAN UTAMA WEBSITE */}
      {activePage === 'home' && (
        <>
          <Navbar
            onNavigatePage={(page) => navigateToPage(page)}
            onDataUpdated={triggerDataRefresh}
          />

          <Hero refreshTrigger={refreshTrigger} />
          <SpecialShowcase refreshTrigger={refreshTrigger} />

          {/* Gelombang: Putih ke Merah Maroon */}
          <WaveDivider topColor="#FFFFFF" bottomColor="#9a1006" variant={1} />

          <MenuSection
            onOpenAuth={() => navigateToPage('login')}
            refreshTrigger={refreshTrigger}
          />

          {/* Gelombang: Merah Maroon ke Putih */}
          <WaveDivider topColor="#9a1006" bottomColor="#FFFFFF" variant={2} />

          <TestimonialSection
            refreshTrigger={refreshTrigger}
            onOpenAllReviews={() => navigateToPage('all-reviews')}
          />

          {/* Gelombang: Putih ke Hitam */}
          <WaveDivider topColor="#FFFFFF" bottomColor="#141414" variant={1} />

          <MapsSection
            onOpenAuth={() => navigateToPage('login')}
            onOpenAllPhotos={() => navigateToPage('all-photos')}
          />

          {/* Gelombang: Hitam ke Kuning Emas */}
          <WaveDivider topColor="#141414" bottomColor="#FFC72C" variant={1} />

          <ContactSection />

          {/* Gelombang: Kuning Emas ke Maroon Gelap */}
          <WaveDivider topColor="#FFC72C" bottomColor="#2D0000" variant={2} />

          <Footer />
        </>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;