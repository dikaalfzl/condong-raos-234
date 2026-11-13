import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiClock,
  FiNavigation,
  FiMaximize2,
  FiX,
  FiCamera,
  FiTrash2,
  FiUpload,
  FiArrowRight,
} from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { analyzeImageSafety, containsBannedText } from '../../utils/imageSafety';
import '../../styles/MapsSection.css';

const info = [
  {
    icon: <FiMapPin style={{ fontSize: 20, color: '#FFFFFF' }} />,
    label: 'Alamat',
    value:
      'Jl. Lanud Sukani No.40, Blok Kliwon, Mekarsari, Kec. Jatiwangi, Kabupaten Majalengka, Jawa Barat 45454',
  },
  {
    icon: <FiClock style={{ fontSize: 20, color: '#FFFFFF' }} />,
    label: 'Jam Buka',
    value: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          columnGap: '8px',
          rowGap: '4px',
        }}
      >
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
    icon: <FiNavigation style={{ fontSize: 20, color: '#FFFFFF' }} />,
    label: 'Petunjuk Arah',
    value: 'Tersedia via Google Maps — klik tombol di bawah',
  },
];

export const defaultLocationPhotos = [
  {
    id: 'default-1',
    src: '/foto1.webp',
    title: 'Tampilan Depan Tempat Usaha',
    caption:
      'Area depan Bakso & Mie Ayam Condong Raos 234 di Jl. Lanud Sukani No. 40',
    uploaderName: 'Foto Resmi Toko',
    isOfficial: true,
  },
  {
    id: 'default-2',
    src: '/foto2.webp',
    title: 'Area Makan Pelanggan',
    caption:
      'Suasana tempat makan yang bersih, nyaman, dan luas untuk keluarga',
    uploaderName: 'Foto Resmi Toko',
    isOfficial: true,
  },
];

const INITIAL_PHOTO_LIMIT = 4;

export default function MapsSection({ onOpenAuth, onOpenAllPhotos }) {
  const { user, isAdmin, showToast } = useAuth();
  const [customerPhotos, setCustomerPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [scanningPhoto, setScanningPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchCustomerPhotos = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
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
          uploaderAvatar: item.profiles?.avatar_url || null,
          createdAt: item.created_at,
          isOfficial: false,
        }));
        setCustomerPhotos(formatted);
      }
    } catch (err) {
      console.error('Gagal memuat foto pelanggan:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchCustomerPhotos();

    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase
      .channel('public:store_photos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_photos' },
        () => {
          fetchCustomerPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomerPhotos]);

  const handleOpenUploadModal = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      else showToast('Silakan masuk terlebih dahulu untuk menambahkan foto.', 'info');
      return;
    }
    setUploadError('');
    setPhotoTitle('');
    setPhotoCaption('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setUploadModalOpen(true);
  };

  const handleFileSelect = async (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Format file harus JPG, JPEG, PNG, atau WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Ukuran foto maksimal 3 MB.');
      e.target.value = '';
      return;
    }

    setScanningPhoto(true);
    const safetyResult = await analyzeImageSafety(file);
    setScanningPhoto(false);

    if (!safetyResult.safe) {
      setPhotoFile(null);
      setPhotoPreview(null);
      e.target.value = '';
      setUploadError(safetyResult.reason);
      showToast('Foto tidak dapat diunggah karena tidak sesuai ketentuan.', 'error');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!photoFile) {
      setUploadError('Silakan pilih foto terlebih dahulu.');
      return;
    }

    if (containsBannedText(photoTitle) || containsBannedText(photoCaption)) {
      setUploadError('Judul atau keterangan mengandung kata yang tidak diizinkan.');
      return;
    }

    setUploading(true);
    try {
      const ext = photoFile.name.split('.').pop().toLowerCase();
      const filePath = `${user.id}/suasana-${Date.now()}.${ext}`;

      const { error: storageErr } = await supabase.storage
        .from('store-images')
        .upload(filePath, photoFile, { upsert: true });

      if (storageErr) throw storageErr;

      const { data: publicUrlData } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      const { error: dbErr } = await supabase.from('store_photos').insert({
        user_id: user.id,
        image_url: publicUrlData.publicUrl,
        title: photoTitle.trim() || 'Momen Pelanggan',
        caption: photoCaption.trim() || '',
      });

      if (dbErr) throw dbErr;

      showToast('Foto suasana berhasil diunggah! Terima kasih.', 'success');
      setUploadModalOpen(false);
      await fetchCustomerPhotos();
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

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
      await fetchCustomerPhotos();
    } catch (err) {
      showToast(`Gagal menghapus foto: ${err.message}`, 'error');
    }
  };

  const allPhotos = [...defaultLocationPhotos, ...customerPhotos];
  const displayedPhotos = allPhotos.slice(0, INITIAL_PHOTO_LIMIT);

  return (
    <section id="maps" style={{ padding: '88px 0 72px', background: '#141414' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 44 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 9999,
              background: '#9a1006',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            📍 Lokasi Kami
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Temukan Kami di Sini
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.65,
              maxWidth: 440,
              margin: '0 auto',
            }}
          >
            Lokasi strategis dan siap melayani Anda setiap hari dengan sepenuh hati.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 32,
            alignItems: 'start',
          }}
          className="maps-grid"
        >
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
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
                  borderRadius: 18,
                  background: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: '#9a1006',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(154, 16, 6, 0.28)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#9a1006',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      color: '#1A1A1A',
                      fontWeight: 600,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            <a
              href="https://maps.app.goo.gl/W7MEgaosaZAdUcdj7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sweep-red-to-white"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '15px 24px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                marginTop: 4,
              }}
            >
              <FiNavigation />
              <span>Buka di Google Maps</span>
            </a>
          </motion.div>
        </div>

        {/* === GALERI FOTO SUASANA === */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginTop: 52 }}
        >
          <div className="gallery-header-bar">
            <div className="gallery-title-group">
              <div className="gallery-title-row">
                <h3 className="gallery-main-title">
                  🏪 Foto Tampilan Depan & Suasana
                </h3>
                <span className="gallery-count-pill">{allPhotos.length} Foto</span>
              </div>
              <p className="gallery-subtitle-text">
                🔍 Klik foto untuk ukuran penuh • Pelanggan dapat ikut berbagi foto suasana
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="btn-add-photo btn-sweep-red-to-white"
            >
              <FiCamera size={17} />
              <span>Tambah Foto Suasana</span>
            </button>
          </div>

          <div className="photo-grid">
            {displayedPhotos.map((photo) => {
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

          <div
            style={{
              textAlign: 'center',
              marginTop: 22,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              className="btn-add-photo btn-sweep-red-to-white"
              style={{
                width: 'auto',
                borderRadius: 999,
                padding: '9px 18px',
                fontSize: '0.76rem',
                gap: 6,
              }}
              onClick={() => onOpenAllPhotos && onOpenAllPhotos()}
            >
              <span>Lihat Foto Lainnya ({allPhotos.length})</span>
              <FiArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* === MODAL POP-UP UNGGAH FOTO === */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cr-upload-modal-backdrop"
            onClick={() => setUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="cr-upload-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cr-upload-modal-header">
                <button
                  type="button"
                  className="cr-upload-close-btn"
                  onClick={() => setUploadModalOpen(false)}
                >
                  <FiX size={18} />
                </button>
                <h3>📸 Bagikan Foto Suasana</h3>
                <p style={{ marginBottom: 0 }}>
                  Pilih foto terbaik Anda di Warung Bakso & Mie Ayam Condong Raos 234 untuk tampil
                  di galeri pelanggan.
                </p>
              </div>

              <form className="cr-upload-form" onSubmit={handleUploadSubmit}>
                {uploadError && (
                  <div className="cr-upload-error-box">⚠️ {uploadError}</div>
                )}

                <div className="cr-upload-field">
                  <label className="cr-field-label">
                    PILIH FOTO (WAJIB • JPG / PNG / WEBP, MAKS 3 MB)
                  </label>

                  {photoPreview && (
                    <div className="cr-photo-preview-box">
                      <img src={photoPreview} alt="Preview" />
                    </div>
                  )}

                  <label className="cr-file-picker-btn">
                    <span className="cr-picker-icon">
                      <FiUpload size={15} />
                    </span>
                    <span>
                      {scanningPhoto
                        ? 'Memproses Foto...'
                        : photoFile
                        ? 'Ganti File Foto Lainnya'
                        : 'Pilih Foto dari HP / Laptop'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      disabled={scanningPhoto || uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="cr-upload-field">
                  <label className="cr-field-label">
                    Judul Foto (Opsional / Tidak Wajib)
                  </label>
                  <input
                    type="text"
                    className="cr-upload-input"
                    placeholder="Contoh: Makan Siang Bersama Keluarga"
                    maxLength={45}
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                  />
                </div>

                <div className="cr-upload-field">
                  <label className="cr-field-label">
                    Keterangan Singkat (Opsional / Tidak Wajib)
                  </label>
                  <textarea
                    className="cr-upload-textarea"
                    rows={3}
                    placeholder="Ceritakan pengalaman seru Anda..."
                    maxLength={120}
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="cr-upload-submit-btn btn-sweep-red-to-white"
                  disabled={uploading || scanningPhoto}
                >
                  <span>
                    {scanningPhoto
                      ? 'Memproses Foto...'
                      : uploading
                      ? 'Mengunggah Foto...'
                      : 'Unggah Foto Sekarang'}
                  </span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
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
              <div
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
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
                    <p style={{ fontSize: '0.88rem', color: '#4A4A4A' }}>
                      {selectedPhoto.caption}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}