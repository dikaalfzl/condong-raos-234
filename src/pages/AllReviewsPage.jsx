import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiSearch,
  FiMessageSquare,
  FiCornerDownRight,
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useBackButton } from '../hooks/useBackButton';
import '../styles/AllReviewsPage.css';

const KATEGORI_FILTER = [
  { id: 'semua', label: '🍽️ Semua' },
  { id: 'makanan', label: '🍜 Makanan' },
  { id: 'minuman', label: '🥤 Minuman' },
  { id: 'pelengkap', label: '🥟 Pelengkap' },
];

const STAR_OPTIONS = [
  { id: 'semua', label: '⭐ Semua Rating' },
  { id: '5', label: '★★★★★ (Bintang 5)' },
  { id: '4', label: '★★★★☆ (Bintang 4)' },
  { id: '3', label: '★★★☆☆ (Bintang 3)' },
  { id: '2', label: '★★☆☆☆ (Bintang 2)' },
  { id: '1', label: '★☆☆☆☆ (Bintang 1)' },
];

export default function AllReviewsPage({ onBack }) {
  // Tangkap tombol Back HP agar kembali ke halaman utama
  useBackButton(true, onBack);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [selectedMenuName, setSelectedMenuName] = useState('semua');
  const [selectedStar, setSelectedStar] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [openDropdown, setOpenDropdown] = useState(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllReviews = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles ( full_name, avatar_url ),
          menus ( id, name, category, image_url ),
          review_replies ( reply )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Gagal memuat semua ulasan:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAllReviews();
  }, [fetchAllReviews]);

  const availableMenuNames = useMemo(() => {
    const filteredByCat =
      selectedCategory === 'semua'
        ? reviews
        : reviews.filter(
            (r) =>
              (r.menus?.category || 'makanan').toLowerCase() === selectedCategory
          );
    const names = filteredByCat.map((r) => r.menus?.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [reviews, selectedCategory]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const menuCat = (rev.menus?.category || 'makanan').toLowerCase();
      const menuName = rev.menus?.name || 'Menu Condong Raos';
      const reviewerName = rev.profiles?.full_name || 'Pelanggan';
      const commentText = rev.comment || '';

      const matchCat =
        selectedCategory === 'semua' || menuCat === selectedCategory;
      const matchMenu =
        selectedMenuName === 'semua' || menuName === selectedMenuName;
      const matchStar =
        selectedStar === 'semua' || Number(rev.rating) === Number(selectedStar);
      const matchSearch =
        !searchQuery.trim() ||
        menuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commentText.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchMenu && matchStar && matchSearch;
    });
  }, [reviews, selectedCategory, selectedMenuName, selectedStar, searchQuery]);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : '5.0';

  return (
    <div className="subpage-wrapper">
      <header className="subpage-navbar">
        <div className="subpage-navbar-inner">
          <div onClick={onBack} className="subpage-brand">
            <img
              src="/logo_merah.webp"
              alt="Condong Raos 234"
              onError={(e) => {
                e.currentTarget.src = '/logo.webp';
              }}
            />
            <div className="subpage-brand-text">
              <div className="subpage-brand-title">Bakso & Mie Ayam</div>
              <div className="subpage-brand-sub">Ulasan Condong Raos 234</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="subpage-back-btn btn-sweep-red-to-white"
          >
            <FiArrowLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>
      </header>

      <div className="subpage-container">
        <div className="reviews-hero-banner">
          <div className="banner-left-col">
            <span className="banner-pill-tag">★ SUARA PELANGGAN SETIA</span>
            <h1>Semua Ulasan & Rating Menu</h1>
          </div>

          <div className="reviews-score-box">
            <span className="score-big">★ {avgRating}</span>
            <span className="score-sub">({reviews.length} Ulasan)</span>
          </div>
        </div>

        <div className="reviews-filter-panel" ref={filterBarRef}>
          <div className="category-pills-row">
            {KATEGORI_FILTER.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedMenuName('semua');
                }}
                className={`cat-filter-pill ${
                  selectedCategory === cat.id ? 'active' : ''
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="compact-controls-grid">
            <div className="custom-menu-dropdown">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'menu' ? null : 'menu')
                }
                className={`custom-dropdown-trigger ${
                  openDropdown === 'menu' ? 'open' : ''
                }`}
              >
                <span className="trigger-label">
                  🍜{' '}
                  {selectedMenuName === 'semua'
                    ? `Semua Menu (${availableMenuNames.length})`
                    : selectedMenuName}
                </span>
                <FiChevronDown
                  size={15}
                  className={`chevron-ic ${
                    openDropdown === 'menu' ? 'rotate' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'menu' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="custom-dropdown-menu"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMenuName('semua');
                        setOpenDropdown(null);
                      }}
                      className={`dropdown-option-item ${
                        selectedMenuName === 'semua' ? 'selected' : ''
                      }`}
                    >
                      <span>🍽️ Semua Menu ({availableMenuNames.length})</span>
                      {selectedMenuName === 'semua' && <FiCheck size={14} />}
                    </button>

                    {availableMenuNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedMenuName(name);
                          setOpenDropdown(null);
                        }}
                        className={`dropdown-option-item ${
                          selectedMenuName === name ? 'selected' : ''
                        }`}
                      >
                        <span>🍜 {name}</span>
                        {selectedMenuName === name && <FiCheck size={14} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="custom-menu-dropdown">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'star' ? null : 'star')
                }
                className={`custom-dropdown-trigger ${
                  openDropdown === 'star' ? 'open' : ''
                }`}
              >
                <span className="trigger-label">
                  {selectedStar === 'semua'
                    ? '⭐ Semua Bintang'
                    : `★ Bintang ${selectedStar}`}
                </span>
                <FiChevronDown
                  size={15}
                  className={`chevron-ic ${
                    openDropdown === 'star' ? 'rotate' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'star' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="custom-dropdown-menu"
                  >
                    {STAR_OPTIONS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStar(st.id);
                          setOpenDropdown(null);
                        }}
                        className={`dropdown-option-item ${
                          selectedStar === st.id ? 'selected' : ''
                        }`}
                      >
                        <span>{st.label}</span>
                        {selectedStar === st.id && <FiCheck size={14} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="filter-search-box">
              <FiSearch size={15} color="#9a1006" />
              <input
                type="text"
                placeholder="Cari nama pelanggan, menu, atau ulasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-result-info">
          <span>
            Menampilkan <strong>{filteredReviews.length}</strong> ulasan
            {selectedCategory !== 'semua'
              ? ` • ${selectedCategory.toUpperCase()}`
              : ''}
            {selectedMenuName !== 'semua' ? ` • ${selectedMenuName}` : ''}
            {selectedStar !== 'semua' ? ` • ★${selectedStar}` : ''}
          </span>

          {(selectedCategory !== 'semua' ||
            selectedMenuName !== 'semua' ||
            selectedStar !== 'semua' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('semua');
                setSelectedMenuName('semua');
                setSelectedStar('semua');
                setSearchQuery('');
              }}
              className="reset-filter-btn"
            >
              Reset Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="subpage-empty-box">Memuat seluruh ulasan pelanggan...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="subpage-empty-box">
            <FiMessageSquare size={32} color="#9a1006" />
            <p>Belum ada ulasan yang sesuai dengan filter yang dipilih.</p>
          </div>
        ) : (
          <div className="all-reviews-grid">
            {filteredReviews.map((rev, idx) => {
              const name = rev.profiles?.full_name || 'Pelanggan Setia';
              const avatar = rev.profiles?.avatar_url;
              const menuName = rev.menus?.name || 'Menu Condong Raos';
              const menuCategory = (rev.menus?.category || 'makanan').toUpperCase();
              const replyText = Array.isArray(rev.review_replies)
                ? rev.review_replies[0]?.reply
                : rev.review_replies?.reply;

              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                  className="fullpage-review-card"
                >
                  <div>
                    <div className="fp-review-top">
                      <div className="fp-reviewer-info">
                        {avatar ? (
                          <img src={avatar} alt={name} className="fp-avatar-img" />
                        ) : (
                          <div className="fp-avatar-fallback">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="fp-reviewer-meta">
                          <div className="fp-reviewer-name">{name}</div>
                          <div className="fp-menu-tags">
                            <span className="fp-menu-name">🍜 {menuName}</span>
                            <span className="fp-cat-badge">{menuCategory}</span>
                          </div>
                        </div>
                      </div>

                      <div className="fp-stars-badge">
                        {'★'.repeat(rev.rating || 5)}
                      </div>
                    </div>

                    <p className="fp-comment-text">"{rev.comment}"</p>

                    {replyText && (
                      <div className="fp-admin-reply">
                        <FiCornerDownRight size={14} className="reply-ic" />
                        <div>
                          <strong>Balasan Admin Condong Raos:</strong>
                          <p>{replyText}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="fp-review-date">
                    {new Date(rev.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}