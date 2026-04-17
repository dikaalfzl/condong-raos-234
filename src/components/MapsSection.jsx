import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiNavigation } from 'react-icons/fi';

const info = [
  {
    icon: <FiMapPin style={{ fontSize: 20, color: '#8B0000' }} />,
    label: 'Alamat',
    value: 'Jl. Lanud Sukani No.40, Blok Kliwon, Mekarsari, Kec. Jatiwangi, Kabupaten Majalengka, Jawa Barat 45454',
  },
  {
    icon: <FiClock style={{ fontSize: 20, color: '#8B0000' }} />,
    label: 'Jam Buka',
    value: (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', columnGap: '8px', rowGap: '4px' }}>
        <span>Senin - Sabtu</span>
        <span>•</span>
        <span>10.00 - 22.00 WIB</span>
        
        <span>Minggu</span>
        <span>•</span>
        <span>02.00 - 22.00 WIB</span>
      </div>
    ),
  },
  {
    icon: <FiNavigation style={{ fontSize: 20, color: '#8B0000' }} />,
    label: 'Petunjuk Arah',
    value: 'Tersedia via Google Maps — klik tombol di bawah',
  },
];

// Pastikan file foto ini sudah Anda simpan di dalam folder "public"
const locationPhotos = [
  '/public/foto1.jpeg', 
  '/public/foto2.jpeg',
  '/public/foto3.jpeg',
  '/public/foto4.jpeg'
];

export default function MapsSection() {
  return (
    <section id="maps" style={{
      padding: '88px 0 72px',
      background: '#FFFFFF',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 9999,
            background: '#FDEDEC',
            color: '#8B0000',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            📍 Lokasi Kami
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 800,
            color: '#1A1A1A',
            lineHeight: 1.2,
            marginBottom: 12,
          }}>
            Temukan Kami di Sini
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#6B6B6B',
            lineHeight: 1.65,
            maxWidth: 440,
            margin: '0 auto',
          }}>
            Lokasi strategis dan siap melayani Anda setiap hari dengan sepenuh hati.
          </p>
        </motion.div>

        {/* BAGIAN PETA & INFO KONTAK */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 32,
          alignItems: 'start',
        }} className="maps-grid">
          
          {/* Peta Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #E8E8E8',
            }}
          >
            <iframe
              title="Lokasi Bakso Condong Raos"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d589.0068159582056!2d108.25404413445554!3d-6.727109429122506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ed96a1eaaafbd%3A0xe29121f16983a78a!2sBakso%20%26%20Mie%20Ayam%20234%20Condong%20Raos!5e0!3m2!1sid!2sid!4v1776267475056!5m2!1sid!2sid"
              width="100%"
              height="420"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Info & Tombol Navigasi */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {info.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '20px',
                  borderRadius: 16,
                  background: '#FEF5F5',
                  border: '1px solid #FDEDEC',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#8B0000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    color: '#2D2D2D',
                    fontWeight: 500,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            <a
              href="https://maps.app.goo.gl/W7MEgaosaZAdUcdj7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-maps-sweep"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '15px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #8B0000, #C0392B)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(139,0,0,0.35)',
                marginTop: 4,
              }}
            >
              <FiNavigation style={{ position: 'relative', zIndex: 2 }} />
              <span style={{ position: 'relative', zIndex: 2 }}>Buka di Google Maps</span>
            </a>
          </motion.div>
        </div>

        {/* === GALERI FOTO SUASANA === */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            marginTop: 40,
          }}
        >
          {/* === TAMBAH CLASS photo-grid DI SINI === */}
          <div className="photo-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
          }}>
            {locationPhotos.map((photo, index) => (
              <div key={index} className="photo-card" style={{
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                paddingBottom: '75%', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                background: '#F9F2F2',
              }}>
                <img 
                  src={photo} 
                  alt={`Suasana Bakso Condong Raos ${index + 1}`} 
                  className="photo-img"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', 
                    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML += '<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 48px; background: #FEF5F5;">🍜</div>';
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      <style>{`
        /* RESPONSIVE LAYOUT */
        @media (max-width: 860px) {
          .maps-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* === KUNCI 2x2 GRID UNTUK MOBILE === */
        @media (max-width: 600px) {
          .photo-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important; /* Jarak antar foto sedikit diperkecil agar pas di HP */
          }
          .photo-card {
            border-radius: 12px !important; /* Ujung lengkungan disesuaikan untuk mobile */
          }
        }

        /* EFEK ZOOM UNTUK FOTO */
        .photo-card {
          cursor: pointer;
        }
        .photo-card:hover .photo-img {
          transform: scale(1.1); 
        }

        /* EFEK SWEEP UP TOMBOL MAPS */
        .btn-maps-sweep {
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .btn-maps-sweep::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background-color: #1A1A1A; 
          border-radius: 50% 50% 0 0;
          transition: top 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0; 
        }
        .btn-maps-sweep:hover::before {
          top: -25%;
        }
        .btn-maps-sweep:hover {
          box-shadow: 0 10px 25px rgba(26, 26, 26, 0.4) !important;
          transform: translateY(-3px); 
        }
      `}</style>
    </section>
  );
}