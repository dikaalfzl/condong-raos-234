import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

export default function MenuCard({ item, index }) {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: (index % 4) * 0.08 }}
        whileHover={{ y: -6 }}
        className="menu-card-sweep" /* Memanggil class CSS untuk efek double-sweep */
      >
        {/* === LABEL TERLARIS === */}
        {item.popular && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 3, /* Z-index tinggi agar tidak tertutup animasi */
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #8B0000, #C0392B)',
            color: 'white',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.4px',
            boxShadow: '0 2px 8px rgba(139,0,0,0.4)',
          }}>
            <FiStar style={{ fontSize: 10 }} />
            TERLARIS
          </div>
        )}

        {/* === GAMBAR MENU === */}
        <div style={{
          position: 'relative',
          zIndex: 2, /* Z-index 2 agar gambar tetap di atas efek sapuan */
          width: '100%',
          paddingBottom: '68%',
          overflow: 'hidden',
          background: '#F9F2F2',
        }}>
          {!imgError ? (
            <img
              src={item.image}
              alt={item.name}
              onError={() => setImgError(true)}
              className="menu-img"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              background: '#FEF5F5',
            }}>
              🍜
            </div>
          )}
          {/* Bayangan gradasi hitam di bawah gambar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* === AREA TEKS === */}
        <div style={{ 
          padding: '16px 16px 18px', 
          position: 'relative', 
          zIndex: 2 /* Z-index 2 agar teks terbaca di atas animasi hitam */
        }}>
          <h3 className="menu-title" style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 6,
            lineHeight: 1.3,
          }}>
            {item.name}
          </h3>
          <p className="menu-desc" style={{
            fontSize: '0.8rem',
            color: '#6B6B6B',
            lineHeight: 1.55,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.description}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span className="menu-price" style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#8B0000',
              letterSpacing: '-0.3px',
            }}>
              {item.price}
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8B0000, #C0392B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(139,0,0,0.3)',
            }}>
              🔥
            </div>
          </div>
        </div>
      </motion.div>

      {/* === CSS EFEK DOUBLE SWEEP === */}
      <style>{`
        /* KOTAK DASAR */
        .menu-card-sweep {
          position: relative;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #F3F3F3;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: box-shadow 0.3s ease;
          cursor: pointer;
        }

        /* BAYANGAN SAAT DI-HOVER */
        .menu-card-sweep:hover {
          box-shadow: 0 16px 40px rgba(26, 26, 26, 0.25);
        }

        /* EFEK ZOOM GAMBAR SAAT DI-HOVER */
        .menu-card-sweep:hover .menu-img {
          transform: scale(1.08);
        }

        /* GELOMBANG 1: MERAH (Berada di paling bawah z-index 0) */
        .menu-card-sweep::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background-color: #8B0000;
          border-radius: 50% 50% 0 0;
          z-index: 0;
          /* Saat mouse keluar: Merah menunggu 0.15s agar hitam turun duluan */
          transition: top 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
        }

        /* GELOMBANG 2: HITAM (Berada di atas merah z-index 1) */
        .menu-card-sweep::after {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background-color: #1A1A1A; /* Hitam elegan */
          border-radius: 50% 50% 0 0;
          z-index: 1;
          /* Saat mouse keluar: Hitam langsung meluncur turun tanpa jeda */
          transition: top 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0s;
        }

        /* AKSI SAAT DI-HOVER */
        .menu-card-sweep:hover::before {
          top: -25%;
          /* Merah langsung meluncur naik tanpa jeda */
          transition-delay: 0s;
        }

        .menu-card-sweep:hover::after {
          top: -25%;
          /* Hitam menunggu 1s, membuntuti si merah */
          transition-delay: 0.15s;
        }

        /* PERUBAHAN WARNA TEKS */
        .menu-title, .menu-desc, .menu-price {
          transition: color 0.3s ease 0.1s; /* Sedikit jeda agar pas dengan gelombang hitam */
        }
        
        .menu-card-sweep:hover .menu-title, 
        .menu-card-sweep:hover .menu-desc, 
        .menu-card-sweep:hover .menu-price {
          color: white !important;
        }
      `}</style>
    </>
  );
}