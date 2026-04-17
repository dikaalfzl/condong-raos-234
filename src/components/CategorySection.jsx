import { motion } from 'framer-motion';
import { categories } from '../data/menuData';

export default function CategorySection({ activeCategory, onSelect }) {
  return (
    <>
      <div className="category-container">
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(cat.id)}
              className={`category-btn ${isActive ? 'active' : ''}`}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-text">{cat.label}</span>
            </motion.button>
          );
        })}
      </div>

      <style>{`
        .category-container {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: nowrap;
          padding: 4px 4px 24px 4px;
          margin-bottom: 32px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-container::-webkit-scrollbar {
          display: none;
        }

        .category-btn {
          position: relative; 
          overflow: hidden;   
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 18px;
          border: 2px solid #E8E8E8;
          background: white;
          color: #2D2D2D;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 90px;
          flex-shrink: 0;
        }

        /* === LAPISAN 1: OMBAK MERAH === */
        .category-btn::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background: #8B0000;
          border-radius: 50% 50% 0 0;
          z-index: -2;
          transition: top 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* === LAPISAN 2: OMBAK HITAM === */
        .category-btn::after {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background: #1A1A1A;
          border-radius: 50% 50% 0 0;
          z-index: -1;
          transition: top 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
        }

        /* === HANYA MUNCUL SAAT DIKLIK (AKTIF) === */
        /* Bagian hover dihapus dari sini */
        .category-btn.active::before {
          top: -25%;
          transition-delay: 0s;
        }

        .category-btn.active::after {
          top: -25%;
          transition-delay: 0.1s;
        }

        /* PERUBAHAN WARNA TEKS & ICON HANYA SAAT AKTIF */
        .category-btn.active {
          border-color: #1A1A1A;
          color: white !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .category-icon {
          font-size: 26px;
          line-height: 1;
        }

        .category-text {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        /* RESPONSIVE MOBILE */
        @media (max-width: 600px) {
          .category-container {
            gap: 8px;
            justify-content: flex-start;
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .category-btn {
            padding: 12px 10px;
            min-width: 85px;
            flex: 1;
          }
          
          .category-icon { font-size: 22px; }
          .category-text { font-size: 0.7rem; }
        }
      `}</style>
    </>
  );
}