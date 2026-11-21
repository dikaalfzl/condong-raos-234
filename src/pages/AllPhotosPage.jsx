import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiMaximize2,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { defaultLocationPhotos } from '../components/sections/MapsSection';
import { useBackButton } from '../hooks/useBackButton';
import '../styles/AllPhotosPage.css';

export default function AllPhotosPage({ onBack }) {
  // Tangkap tombol Back HP agar kembali ke halaman utama
  useBackButton(true, onBack);

  const { user, isAdmin, showToast } = useAuth();
  const [customerPhotos, setCustomerPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filterType, setFilterType] = useState('semua');

  const fetchCustomerPhotos = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_photos')
        .select(`
          id,
          user_id,
          image_url,
          title,
          caption,
          created_at,
          profiles ( full_name, avatar_url )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          src: item.image_url,
          title: item.title || '',
          caption: item.caption || '',
          uploaderName: item.profiles?.full_name || 'Pelanggan',
          createdAt: item.created_at,
          isOfficial: false,
        }));
        setCustomerPhotos(formatted);
      }
    } catch (err) {
      console.error('Gagal memuat foto suasana:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCustomerPhotos();
  }, [fetchCustomerPhotos]);

  const handleDeleteCustomerPhoto = async (photo, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Hapus foto suasana ini?')) return;
    try {
      const { error } = await supabase
        .from('store_photos')
        .delete()
        .eq('id', photo.id);
      if (error) throw error;
      showToast('Foto berhasil dihapus.', 'info');
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
      fetchCustomerPhotos();
    } catch (err) {
      showToast(`Gagal menghapus foto: ${err.message}`, 'error');
    }
  };

  const allPhotos = [...defaultLocationPhotos, ...customerPhotos];
  const filteredPhotos = allPhotos.filter((p) => {
    if (filterType === 'resmi') return p.isOfficial;
    if (filterType === 'pelanggan') return !p.isOfficial;
    return true;
  });

  return (
    <div className="photos-page-wrapper">
      <header className="photos-navbar">
        <div className="photos-navbar-inner">
          <div onClick={onBack} className="photos-brand">
            <img
              src="/logo_merah.webp"
              alt="Condong Raos 234"
              onError={(e) => {
                e.currentTarget.src = '/logo.webp';
              }}
            />
            <div className="photos-brand-text">
              <div className="photos-brand-title">Bakso & Mie Ayam</div>
              <div className="photos-brand-sub">Galeri Suasana Condong Raos 234</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="photos-back-btn btn-sweep-red-to-white"
          >
            <FiArrowLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>
      </header>

      <div className="photos-page-container">
        <div className="photos-compact-header">
          <div className="photos-title-area">
            <div className="photos-badge-row">
              <span className="photos-mini-tag">📸 GALERI WARUNG</span>
              <span className="photos-count-pill">{filteredPhotos.length} Foto</span>
            </div>
            <h1>Foto Tampilan Depan & Suasana</h1>
            <p>Klik pada foto untuk melihat ukuran penuh.</p>
          </div>

          <div className="photos-segmented-bar">
            <button
              type="button"
              onClick={() => setFilterType('semua')}
              className={`seg-photo-btn ${filterType === 'semua' ? 'active' : ''}`}
            >
              Semua ({allPhotos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('resmi')}
              className={`seg-photo-btn ${filterType === 'resmi' ? 'active' : ''}`}
            >
              ⭐ Resmi ({defaultLocationPhotos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pelanggan')}
              className={`seg-photo-btn ${filterType === 'pelanggan' ? 'active' : ''}`}
            >
              📸 Pelanggan ({customerPhotos.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="photos-empty-state">Memuat semua foto suasana...</div>
        ) : filteredPhotos.length === 0 ? (
          <div className="photos-empty-state">
            Belum ada foto pada kategori ini.
          </div>
        ) : (
          <div className="all-page-photo-grid">
            {filteredPhotos.map((photo) => {
              const canDelete =
                !photo.isOfficial && user && (user.id === photo.user_id || isAdmin);
              const showCustomTitle =
                photo.title && photo.title !== 'Momen Pelanggan';

              return (
                <div
                  key={photo.id}
                  className="photo-card"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.src}
                    alt={photo.title || 'Foto Suasana Condong Raos'}
                    loading="lazy"
                    className="photo-img"
                  />

                  <div
                    className={`photo-uploader-badge ${
                      photo.isOfficial ? 'official' : 'customer'
                    }`}
                  >
                    {photo.isOfficial ? '⭐ Foto Resmi' : `📸 ${photo.uploaderName}`}
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      className="photo-delete-btn"
                      title="Hapus foto ini"
                      onClick={(e) => handleDeleteCustomerPhoto(photo, e)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}

                  <div className="photo-caption-overlay">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {showCustomTitle && (
                        <div className="photo-caption-title">{photo.title}</div>
                      )}
                      {photo.caption && (
                        <div className="photo-caption-sub">{photo.caption}</div>
                      )}
                    </div>
                    <span className="photo-zoom-icon">
                      <FiMaximize2 size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2500,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 860,
                width: '100%',
                background: '#FFFFFF',
                borderRadius: 24,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  zIndex: 10,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <FiX />
              </button>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title || 'Foto Suasana'}
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{ padding: '18px 24px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#9a1006',
                    marginBottom: 2,
                  }}
                >
                  {selectedPhoto.isOfficial
                    ? '⭐ Foto Resmi Toko'
                    : `📸 Diunggah oleh: ${selectedPhoto.uploaderName}`}
                </div>
                {selectedPhoto.title && (
                  <h4
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#1A1A1A',
                      marginBottom: 2,
                    }}
                  >
                    {selectedPhoto.title}
                  </h4>
                )}
                {selectedPhoto.caption && (
                  <p style={{ fontSize: '0.88rem', color: '#4A4A4A', margin: 0 }}>
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}