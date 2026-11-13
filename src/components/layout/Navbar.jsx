import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ProfileModal from '../modals/ProfileModal';
import '../../styles/Navbar.css';

const navLinks = [
  { label: 'Beranda', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'Lokasi', href: '#maps' },
  { label: 'Kontak', href: '#contact' },
];

export default function Navbar({ onNavigatePage, onDataUpdated }) {
  const { user, profile, isAdmin, signOut, showToast } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo_merah.webp');

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoError = () => {
    if (logoSrc === '/logo_merah.webp') {
      setLogoSrc('/logo.webp');
    } else if (logoSrc === '/logo.webp') {
      setLogoSrc('/logo.png');
    } else if (logoSrc === '/logo.png') {
      setLogoSrc('/logo_merah.png');
    }
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenProfileClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMenuOpen(false);
    setProfileModalOpen(true);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Pelanggan';

  const displayAvatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <>
      <header
        className="main-navbar-header"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.96)' : '#FFFFFF',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled
            ? '0 4px 20px rgba(0, 0, 0, 0.08)'
            : '0 1px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="navbar-inner-container">
          {/* LOGO MANGKUK 234 & TEKS */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="navbar-brand-link"
          >
            <img
              src={logoSrc}
              alt="Logo Bakso & Mie Ayam Condong Raos 234"
              onError={handleLogoError}
              className="navbar-logo-img"
            />
            <div>
              <div className="navbar-brand-title">Bakso & Mie Ayam</div>
              <div className="navbar-brand-subtitle">Condong Raos 234</div>
            </div>
          </a>

          {/* DESKTOP NAV LINKS */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="nav-item-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* TOMBOL AKUN / ADMIN / LOGIN (DESKTOP: PROFIL DULU BARU DASHBOARD ADMIN) */}
          <div className="desktop-auth-actions">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenProfileClick}
                  className="nav-profile-btn btn-sweep-red-to-white"
                  title="Buka Profil Saya"
                >
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                      }}
                    />
                  ) : (
                    <FiUser size={15} style={{ pointerEvents: 'none' }} />
                  )}
                  <span style={{ pointerEvents: 'none' }}>{displayName}</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onNavigatePage && onNavigatePage('admin')}
                    className="nav-admin-btn"
                  >
                    <FiShield size={15} />
                    <span>Dashboard Admin</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-logout-btn"
                  title="Keluar"
                >
                  <FiLogOut size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onNavigatePage && onNavigatePage('login')}
                className="nav-login-btn btn-sweep-red-to-white"
              >
                <FiUser size={15} />
                <span>Masuk</span>
              </button>
            )}
          </div>

          {/* TOMBOL HAMBURGER MOBILE */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FiX size={19} /> : <FiMenu size={19} />}
          </button>
        </div>

        {/* DRAWER MENU MOBILE (PROFIL SAYA DI ATAS, DASHBOARD ADMIN DI BAWAHNYA) */}
        {menuOpen && (
          <div className="mobile-nav-drawer">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="mobile-nav-link"
              >
                {link.label}
              </a>
            ))}

            <div className="mobile-auth-box">
              {user ? (
                <>
                  {/* 1. TOMBOL PROFIL SAYA DI ATAS */}
                  <button
                    type="button"
                    onClick={handleOpenProfileClick}
                    className="mobile-profile-btn btn-sweep-red-to-white"
                  >
                    <FiUser style={{ pointerEvents: 'none' }} />
                    <span style={{ pointerEvents: 'none' }}>
                      Profil Saya ({displayName})
                    </span>
                  </button>

                  {/* 2. TOMBOL DASHBOARD ADMIN DI TENGAH */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        if (onNavigatePage) onNavigatePage('admin');
                      }}
                      className="mobile-admin-btn"
                    >
                      <FiShield size={15} />
                      <span>Dashboard Admin</span>
                    </button>
                  )}

                  {/* 3. TOMBOL KELUAR DARI AKUN DI BAWAH */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                  >
                    <FiLogOut size={15} />
                    <span>Keluar dari Akun</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (onNavigatePage) onNavigatePage('login');
                  }}
                  className="mobile-login-btn btn-sweep-red-to-white"
                >
                  <FiUser />
                  <span>Masuk ke Akun</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={onDataUpdated}
      />
    </>
  );
}