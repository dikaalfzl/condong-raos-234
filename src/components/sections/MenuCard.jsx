import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import '../../styles/MenuCard.css';

export default function MenuCard({ item, index, ratingStats, onSelectMenu }) {
  const [imgError, setImgError] = useState(false);

  const COLUMNS_PER_ROW = 4;
  const BASE_DELAY = 0.08;
  const staggerDelay = (index % COLUMNS_PER_ROW) * BASE_DELAY;

  const handleImageError = () => {
    console.warn(`Gagal memuat gambar untuk menu: ${item.name}`);
    setImgError(true);
  };

  const count = ratingStats?.count || 0;
  const avg = ratingStats?.avg || 0;
  const isAvailable = item.is_available !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: staggerDelay }}
      whileHover={{ y: -6 }}
      className={`menu-card-sweep ${!isAvailable ? 'menu-sold-out' : ''}`}
      
    >
      {/* === LABEL TERLARIS === */}
      {item.popular && (
        <div className="menu-badge-popular">
          <FiStar className="menu-badge-icon" />
          TERLARIS
        </div>
      )}

      {/* === LABEL STOK HABIS HARI INI === */}
      {!isAvailable && (
        <div className="menu-badge-soldout">
          HABIS HARI INI
        </div>
      )}

      {/* === GAMBAR MENU === */}
      <div className="menu-img-container">
        {!imgError ? (
          <img
            src={item.image}
            alt={`Gambar menu ${item.name}`}
            onError={handleImageError}
            className="menu-img"
          />
        ) : (
          <div className="menu-img-fallback" title="Gambar tidak tersedia">
            🍜
          </div>
        )}
        <div className="menu-img-overlay" />
      </div>

      {/* === AREA TEKS & RATING === */}
      <div className="menu-content">
        <h3 className="menu-title">{item.name}</h3>

        {count > 0 ? (
          <div className="menu-rating-row">
            <span>★ {avg.toFixed(1)}</span>
            <span>({count} ulasan)</span>
          </div>
        ) : (
          <div className="menu-rating-empty">☆ Belum ada ulasan</div>
        )}

        <p className="menu-desc">{item.description}</p>
        
        <div className="menu-footer">
          <span className="menu-price">{item.price}</span>

          {/* ========================================================
             HANYA TOMBOL INI (💬 Ulas) YANG MEMBUKA MODAL ULASAN
             ======================================================== */}
          <button
            type="button"
            className="menu-action-btn"
            onClick={() => {
              if (onSelectMenu) onSelectMenu(item);
            }}
          >
            <span>💬 Ulas</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}