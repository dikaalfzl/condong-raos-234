import { useState, useEffect, useCallback } from 'react';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiSliders,
  FiGrid,
  FiDollarSign,
} from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { slides as defaultSlides } from '../data/menuData';

import MenuTab from '../components/admin/MenuTab';
import SwiperTab from '../components/admin/SwiperTab';
import FinanceTab from '../components/admin/FinanceTab';
import ReviewsTab from '../components/admin/ReviewsTab';
import SettingsTab from '../components/admin/SettingsTab';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ isOpen, onClose, onDataUpdated }) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('menus');
  const [menus, setMenus] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchAllAdminData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: mData } = await supabase
        .from('menus')
        .select('*')
        .order('id', { ascending: true });
      if (mData) setMenus(mData);

      const { data: sData } = await supabase
        .from('hero_slides')
        .select('*')
        .order('id', { ascending: true });
      if (sData && sData.length > 0) {
        setHeroSlides(sData);
      } else {
        setHeroSlides(
          defaultSlides.map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            highlight: s.highlight || 'Menu Andalan',
            badge: s.badge || 'Populer',
            image_url: s.image,
          }))
        );
      }

      const { data: rData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles ( full_name ),
          menus ( name ),
          review_replies ( id, reply )
        `)
        .order('created_at', { ascending: false });
      if (rData) setReviews(rData);
    } catch (err) {
      console.error('Gagal memuat data admin:', err.message);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchAllAdminData();
    }
  }, [isOpen, isAdmin, fetchAllAdminData]);

  if (!isOpen) return null;

  const handleRefreshAll = async () => {
    await fetchAllAdminData();
    if (onDataUpdated) onDataUpdated();
  };

  const uploadImageToBucket = async (file, prefix = 'item') => {
    const ext = file.name.split('.').pop().toLowerCase();
    const filePath = `admin/${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('store-images')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('store-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="admin-fullpage">
      <header className="admin-navbar-header">
        <div className="admin-navbar-inner">
          <div onClick={onClose} className="admin-brand-logo">
            <img
              src="/logo_merah.webp"
              alt="Logo Bakso & Mie Ayam Condong Raos 234"
              className="admin-logo-img"
              onError={(e) => {
                if (e.currentTarget.src.endsWith('/logo_merah.webp')) {
                  e.currentTarget.src = '/logo.webp';
                } else if (e.currentTarget.src.endsWith('/logo.webp')) {
                  e.currentTarget.src = '/logo.png';
                }
              }}
            />
            <div>
              <div className="admin-brand-title">Bakso & Mie Ayam</div>
              <div className="admin-brand-sub">Condong Raos 234 • Admin</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-back-web-btn btn-sweep-red-to-white"
          >
            <FiArrowLeft size={16} />
            <span>Kembali ke Website</span>
          </button>
        </div>
      </header>

      <div className="admin-main-container">
        <div className="admin-tabs-grid">
          <button
            type="button"
            onClick={() => setActiveTab('menus')}
            className={`admin-tab-item ${activeTab === 'menus' ? 'active' : ''}`}
          >
            <FiGrid className="tab-icon" />
            <span>Kelola Menu ({menus.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('swiper')}
            className={`admin-tab-item ${activeTab === 'swiper' ? 'active' : ''}`}
          >
            <span className="tab-icon">🖼️</span>
            <span>Edit Swiper ({heroSlides.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`admin-tab-item ${activeTab === 'finance' ? 'active' : ''}`}
          >
            <FiDollarSign className="tab-icon" />
            <span>Keuangan Harian</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`admin-tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <FiMessageSquare className="tab-icon" />
            <span>Ulasan ({reviews.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <FiSliders className="tab-icon" />
            <span>Status & Promo</span>
          </button>
        </div>

        {activeTab === 'menus' && (
          <MenuTab
            menus={menus}
            onRefresh={handleRefreshAll}
            uploadImageToBucket={uploadImageToBucket}
          />
        )}

        {activeTab === 'swiper' && (
          <SwiperTab
            heroSlides={heroSlides}
            onRefresh={handleRefreshAll}
            uploadImageToBucket={uploadImageToBucket}
          />
        )}

        {activeTab === 'finance' && <FinanceTab />}

        {activeTab === 'reviews' && (
          <ReviewsTab reviews={reviews} onRefresh={handleRefreshAll} />
        )}

        {activeTab === 'settings' && <SettingsTab onDataUpdated={onDataUpdated} />}
      </div>
    </div>
  );
}