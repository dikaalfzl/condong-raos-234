import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySection from './CategorySection';
import MenuCard from './MenuCard';
import { menuItems } from '../data/menuData';

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" style={{
      padding: '88px 0 72px',
      background: 'linear-gradient(180deg, #FEF5F5 0%, #FFFFFF 100%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
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
            🍽️ Menu Kami
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 800,
            color: '#1A1A1A',
            lineHeight: 1.2,
            marginBottom: 12,
          }}>
            Pilihan Menu Lezat
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#6B6B6B',
            lineHeight: 1.65,
            maxWidth: 520,
            margin: '0 auto',
          }}>
            Temukan berbagai pilihan bakso, minuman, dan pelengkap yang dibuat
            dengan bahan segar berkualitas setiap harinya.
          </p>
        </motion.div>

        <CategorySection
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}
            className="menu-grid"
          >
            {filtered.map((item, index) => (
              <MenuCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .menu-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .menu-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          .menu-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
