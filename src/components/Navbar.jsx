import { useState, useEffect } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'Maps', href: '#maps' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      let currentSection = '#home';
      navLinks.forEach((link) => {
        const section = document.querySelector(link.href);
        if (section) {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= sectionTop - 100) {
            currentSection = link.href;
          }
        }
      });
      setActive(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (href) => {
    setActive(href);
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(254, 245, 245, 0.7)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNav('#home'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
          >
            <img 
              src="/logo_merah.png" 
              alt="Logo Bakso Condong Raos" 
              style={{ 
                height: '35px',
                width: 'auto',
                display: 'block'
              }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontSize: '1.05rem', 
                fontWeight: 800, 
                color: '#8B0000', 
                lineHeight: 1.2,
                letterSpacing: '-0.2px'
              }}>
                Bakso & Mie Ayam
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                color: '#C0392B', 
                letterSpacing: '0.5px' 
              }}>
                Condong Raos 234
              </span>
            </div>
          </a>

          <div style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
          }} className="nav-desktop">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                className={`nav-sweep ${active === link.href ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: '0.9rem',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#FDEDEC',
              color: '#8B0000',
              fontSize: 22,
              transition: 'all 0.25s',
              border: 'none',
              cursor: 'pointer',
            }}
            className="nav-hamburger"
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      <div style={{
        position: 'fixed',
        top: 68,
        left: 0,
        right: 0,
        zIndex: 999,
        background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        padding: '12px 16px 20px',
        borderBottom: '1px solid #f3f3f3',
      }} className="nav-mobile-menu">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
            className={`nav-sweep ${active === link.href ? 'active' : ''}`}
            style={{
              display: 'block',
              padding: '14px 16px',
              borderRadius: 12,
              fontSize: '1rem',
              marginBottom: 4,
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <style>{`
        .nav-sweep {
          position: relative;
          overflow: hidden;
          z-index: 1;
          color: #2D2D2D;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .nav-sweep::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background: #FDEDEC;
          border-radius: 50% 50% 0 0;
          transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }

        /* === HANYA AKTIF SAAT MENU DIPILIH === */
        /* Baris :hover telah dihapus dari sini */
        .nav-sweep.active::before {
          top: -25%;
        }

        .nav-sweep.active {
          color: #8B0000 !important;
        }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}