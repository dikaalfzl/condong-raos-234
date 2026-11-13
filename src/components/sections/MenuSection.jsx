import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiSliders,
  FiX,
  FiChevronDown,
  FiStar,
  FiMessageSquare,
  FiTrendingDown,
  FiTrendingUp,
  FiGrid,
  FiCheck,
} from 'react-icons/fi';
import CategorySection from './CategorySection';
import MenuCard from './MenuCard';
import ReviewModal from '../modals/ReviewModal';
import { menuItems as staticMenuItems } from '../../data/menuData';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import '../../styles/MenuSection.css';

const parsePriceNumber = (priceStr, numericFallback = 0) => {
  if (numericFallback && Number(numericFallback) > 0) return Number(numericFallback);
  const digits = String(priceStr || '').replace(/[^0-9]/g, '');
  return Number(digits) || 0;
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Urutkan: Sesuai Standar', icon: <FiGrid /> },
  { value: 'rating_desc', label: 'Rating Tertinggi', icon: <FiStar /> },
  { value: 'reviews_desc', label: 'Paling Banyak Diulas', icon: <FiMessageSquare /> },
  { value: 'price_asc', label: 'Harga Termurah', icon: <FiTrendingDown /> },
  { value: 'price_desc', label: 'Harga Tertinggi', icon: <FiTrendingUp /> },
];

export default function MenuSection({ onOpenAuth, refreshTrigger }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [menus, setMenus] = useState(staticMenuItems);
  const [ratingsMap, setRatingsMap] = useState({});
  const [selectedMenu, setSelectedMenu] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMenusAndRatings = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data: dbMenus } = await supabase
        .from('menus')
        .select('*')
        .order('id', { ascending: true });

      if (dbMenus && dbMenus.length > 0) {
        const normalized = dbMenus.map((m) => ({
          id: m.id,
          category: m.category || 'makanan',
          name: m.name,
          description: m.description,
          price: m.price,
          price_numeric: parsePriceNumber(m.price, m.price_numeric),
          image: m.image_url,
          popular: m.popular,
          is_available: m.is_available !== false,
        }));
        setMenus(normalized);
      }

      const { data: allReviews } = await supabase
        .from('reviews')
        .select('menu_id, rating');

      if (allReviews) {
        const grouped = {};
        allReviews.forEach((r) => {
          if (!grouped[r.menu_id]) {
            grouped[r.menu_id] = { sum: 0, count: 0, avg: 0 };
          }
          grouped[r.menu_id].sum += Number(r.rating);
          grouped[r.menu_id].count += 1;
          grouped[r.menu_id].avg =
            grouped[r.menu_id].sum / grouped[r.menu_id].count;
        });
        setRatingsMap(grouped);
      }
    } catch (err) {
      console.error('Gagal menyinkronkan menu & rating:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchMenusAndRatings();

    if (!isSupabaseConfigured || !supabase) return;

    const menuChannel = supabase
      .channel('public:menus_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, () => {
        fetchMenusAndRatings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, [fetchMenusAndRatings, refreshTrigger]);

  const processedMenus = useMemo(() => {
    let list =
      activeCategory === 'all'
        ? [...menus]
        : menus.filter((item) => item.category === activeCategory);

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'rating_desc') {
      list.sort((a, b) => {
        const avgA = ratingsMap[a.id]?.avg || 0;
        const avgB = ratingsMap[b.id]?.avg || 0;
        if (avgB !== avgA) return avgB - avgA;
        return (ratingsMap[b.id]?.count || 0) - (ratingsMap[a.id]?.count || 0);
      });
    } else if (sortBy === 'reviews_desc') {
      list.sort(
        (a, b) => (ratingsMap[b.id]?.count || 0) - (ratingsMap[a.id]?.count || 0)
      );
    } else if (sortBy === 'price_asc') {
      list.sort(
        (a, b) =>
          parsePriceNumber(a.price, a.price_numeric) -
          parsePriceNumber(b.price, b.price_numeric)
      );
    } else if (sortBy === 'price_desc') {
      list.sort(
        (a, b) =>
          parsePriceNumber(b.price, b.price_numeric) -
          parsePriceNumber(a.price, a.price_numeric)
      );
    }

    return list;
  }, [menus, activeCategory, searchQuery, sortBy, ratingsMap]);

  const activeSortOption =
    SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];

  return (
    <section id="menu" className="menu-section-wrapper">
      <div className="menu-section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="menu-section-header"
        >
          <div className="menu-section-pill">🍽️ Menu Kami</div>
          <h2 className="menu-section-title font-brighly">Pilihan Menu Lezat</h2>
          <p className="menu-section-subtitle">
            Temukan berbagai pilihan bakso, minuman, dan pelengkap yang dibuat
            dengan bahan segar berkualitas setiap harinya. Klik menu untuk melihat
            atau memberikan ulasan pelanggan.
          </p>
        </motion.div>

        <CategorySection
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* SEARCH & CUSTOM ANIMATED SORT BAR */}
        <div className="menu-search-sort-bar">
          <div className="menu-search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari menu favorit (contoh: bakso, mie ayam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Bersihkan pencarian"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="custom-sort-container" ref={dropdownRef}>
            <button
              type="button"
              className={`custom-sort-trigger ${sortDropdownOpen ? 'open' : ''}`}
              onClick={() => setSortDropdownOpen((prev) => !prev)}
            >
              <span className="sort-trigger-left">
                <span className="sort-trigger-icon">
                  <FiSliders />
                </span>
                <span className="sort-trigger-label">{activeSortOption.label}</span>
              </span>
              <FiChevronDown
                className={`sort-chevron ${sortDropdownOpen ? 'rotate' : ''}`}
              />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="custom-sort-menu"
                >
                  <div className="custom-sort-header">URUTKAN MENU BERDASARKAN</div>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`custom-sort-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                      >
                        <span className="sort-item-left">
                          <span className="sort-item-icon">{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        {isSelected && <FiCheck className="sort-item-check" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {processedMenus.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="menu-empty-box"
            >
              <div className="menu-empty-emoji">🍜</div>
              <h4 className="menu-empty-title">
                Menu "{searchQuery}" tidak ditemukan
              </h4>
              <p className="menu-empty-desc">
                Coba gunakan kata kunci lain atau pilih kategori "Semua".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="menu-reset-btn btn-sweep-red-to-white"
              >
                <span>Reset Pencarian</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${sortBy}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="menu-grid"
            >
              {processedMenus.map((item, index) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  index={index}
                  ratingStats={ratingsMap[item.id]}
                  onSelectMenu={(menu) => setSelectedMenu(menu)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReviewModal
        item={selectedMenu}
        isOpen={Boolean(selectedMenu)}
        onClose={() => setSelectedMenu(null)}
        onOpenAuth={onOpenAuth}
        onReviewsChanged={fetchMenusAndRatings}
      />
    </section>
  );
}