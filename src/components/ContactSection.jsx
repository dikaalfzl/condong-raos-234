import { motion } from 'framer-motion';
import { FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

const contactCards = [
  {
    icon: <FiMapPin style={{ fontSize: 24 }} />,
    label: 'Alamat',
    value: 'Jl. Lanud Sukani No. 40, Mekarsari, Jatiwangi, Majalengka',
    href: 'https://maps.app.goo.gl/iDM3jnPBvFMHNQn68',
    color: '#C0392B',
    bg: '#FDEDEC',
  },
  {
    icon: <FaWhatsapp style={{ fontSize: 24 }} />,
    label: 'WhatsApp',
    value: '+62 852-1674-2345',
    href: 'https://wa.me/6285216742345',
    color: '#27AE60',
    bg: '#E9F7EF',
  },
  {
    icon: <FiMail style={{ fontSize: 24 }} />,
    label: 'Email',
    value: 'baksocondongraos234@gmail.com',
    href: 'mailto:baksocondongraos234@gmail.com',
    color: '#2980B9',
    bg: '#EBF5FB',
  },
];

const socials = [
  {
    icon: <FaInstagram />,
    label: '@bakso_condongraos_234',
    href: 'https://www.instagram.com/bakso_condongraos_234',
    color: '#E1306C',
  },
  {
    icon: <FaWhatsapp />,
    label: 'Chat via WA',
    href: 'https://wa.me/6285216742345',
    color: '#25D366',
  },
  /*{
    icon: <FaFacebook />,
    label: 'Bakso Condong Raos',
    href: 'https://facebook.com',
    color: '#1877F2',
  },*/
  {
    icon: <FaTiktok />,
    label: '@condongraos_234',
    href: 'https://www.tiktok.com/@condongraos_234?_r=1&_t=ZS-95bQTSaKuFl',
    color: '#000000',
  },
];

export default function ContactSection() {
  return (
    <section id="contact" style={{
      padding: '88px 0 72px',
      background: '#FEF5F5', /* Warna background loncat/solid */
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* === HEADER BAGIAN CONTACT === */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 9999,
            background: '#FFFFFF',
            color: '#8B0000',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #F3F3F3'
          }}>
            📞 Hubungi Kami
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 800,
            color: '#1A1A1A',
            lineHeight: 1.2,
            marginBottom: 12,
          }}>
            Ayo Terhubung dengan Kami
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#6B6B6B',
            lineHeight: 1.65,
            maxWidth: 460,
            margin: '0 auto',
          }}>
            Punya pertanyaan atau reservasi? Jangan ragu untuk menghubungi kami
            melalui berbagai platform yang tersedia.
          </p>
        </motion.div>

        {/* === 3 KARTU KONTAK (ALAMAT, WA, EMAIL) === */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 48,
        }} className="contact-grid">
          {contactCards.map((card, i) => (
            <motion.a
              key={i}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="btn-sweep card-contact" /* Memanggil class efek animasi */
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                padding: '24px',
                borderRadius: 20,
                background: 'white',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #F3F3F3',
              }}
            >
              <div 
                className="icon-box"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  flexShrink: 0,
                  transition: 'background 0.3s'
                }}
              >
                {card.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-label" style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#A0A0A0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  marginBottom: 4,
                  transition: 'color 0.3s'
                }}>
                  {card.label}
                </div>
                <div className="card-value" style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                  transition: 'color 0.3s'
                }}>
                  {card.value}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* === KOTAK SOSIAL MEDIA === */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            padding: '36px 32px',
            borderRadius: 24,
            background: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid #F3F3F3',
            textAlign: 'center',
          }}
        >
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#8B0000',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Ikuti Kami di Media Sosial
          </p>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {socials.map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="btn-sweep social-btn" /* Memanggil class efek animasi */
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '260px',
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: '#FEF5F5',
                  border: '1px solid #FDEDEC',
                  color: '#2D2D2D',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <span className="social-icon" style={{ 
                  position: 'absolute', 
                  left: '20px', 
                  fontSize: 20, 
                  color: s.color, 
                  display: 'flex',
                  transition: 'color 0.3s'
                }}>
                  {s.icon}
                </span>
                <span className="social-text" style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  marginLeft: '14px',
                  transition: 'color 0.3s'
                }}>
                  {s.label}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* === CSS UNTUK ANIMASI SWEEP (SAPUAN) === */}
      <style>{`
        /* Struktur dasar untuk semua tombol yang punya efek sweep */
        .btn-sweep {
          position: relative; /* Wajib agar sapuan ada di dalam kotak */
          overflow: hidden;   /* Menyembunyikan sapuan sebelum di-hover */
          z-index: 1;         /* Agar teks tetap berada di atas sapuan */
          transition: all 0.3s ease;
        }

        /* Efek sapuan melengkung (Ombak) yang bersembunyi di bawah */
        .btn-sweep::before {
          content: '';
          position: absolute;
          top: 100%; /* Sembunyi di bagian bawah */
          left: -25%; /* Diperlebar agar lengkungannya mulus sampai ujung */
          width: 150%; /* Dibuat lebih lebar dari kotak aslinya */
          height: 200%; /* Jauh lebih tinggi agar akhirnya menutupi penuh kotak */
          background-color: #8B0000; 
          
          /* INI KUNCINYA: Membuat atasnya melengkung, tapi bawahnya rata */
          border-radius: 50% 50% 0 0; 
          
          /* Animasi sedikit diperlambat agar lengkungannya terlihat dramatis */
          transition: top 1s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }

        /* Saat di-hover, ombak naik ke atas */
        .btn-sweep:hover::before {
          /* Naik terus sampai bagian lengkungnya keluar kotak, 
             menyisakan bagian bawahnya yang padat/rata */
          top: -25%; 
        }

        /* Saat di-hover, bayangan kartu membesar */
        .btn-sweep:hover {
          box-shadow: 0 12px 40px rgba(139,0,0,0.2) !important;
          border-color: #8B0000 !important;
        }

        /* UBAH WARNA TEKS & IKON MENJADI PUTIH SAAT DI-HOVER */
        .btn-sweep:hover .card-label,
        .btn-sweep:hover .card-value,
        .btn-sweep:hover .social-text,
        .btn-sweep:hover .social-icon {
          color: white !important;
        }

        /* Khusus untuk ikon kotak (Alamat, WA, Email), backgroundnya jadi transparan putih saat di-hover */
        .btn-sweep:hover .icon-box {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        /* Responsif Grid */
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 900px) {
          .contact-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}