import { useState } from 'react';
import { FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function SwiperTab({ heroSlides, onRefresh, uploadImageToBucket }) {
  const { showToast } = useAuth();
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    highlight: 'Menu Andalan',
    badge: 'Populer',
    image_url: '',
  });
  const [slideFile, setSlideFile] = useState(null);
  const [savingSlide, setSavingSlide] = useState(false);

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    setSavingSlide(true);
    try {
      let finalImg = slideForm.image_url;
      if (slideFile) {
        finalImg = await uploadImageToBucket(slideFile, 'hero-slide');
      }

      const payload = {
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        highlight: slideForm.highlight.trim() || 'Menu Andalan',
        badge: slideForm.badge.trim() || 'Populer',
        image_url: finalImg || '/bakso.webp',
      };

      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', editingSlide.id);
        if (error) throw error;
        showToast('Slide Swiper Hero berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload);
        if (error) throw error;
        showToast('Slide Swiper baru berhasil ditambahkan!', 'success');
      }

      setEditingSlide(null);
      setSlideFile(null);
      setSlideForm({
        title: '',
        subtitle: '',
        highlight: 'Menu Andalan',
        badge: 'Populer',
        image_url: '',
      });
      onRefresh();
    } catch (err) {
      showToast(`Gagal menyimpan slide: ${err.message}`, 'error');
    } finally {
      setSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Hapus slide banner ini?')) return;
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (!error) {
      showToast('Slide berhasil dihapus.', 'info');
      onRefresh();
    }
  };

  return (
    <div className="admin-split-grid">
      <form onSubmit={handleSaveSlide} className="admin-form-card">
        <h3>
          {editingSlide ? `Edit Slide: ${editingSlide.title}` : '➕ Tambah Slide Swiper Baru'}
        </h3>

        <label>Judul Utama Slide (Title)</label>
        <input
          type="text"
          value={slideForm.title}
          onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
          placeholder="Contoh: MIE AYAM BAKSO KOMPLIT"
          required
        />

        <div className="admin-2col">
          <div>
            <label>Label Badge Merah</label>
            <input
              type="text"
              value={slideForm.badge}
              onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
              placeholder="Contoh: Populer"
            />
          </div>
          <div>
            <label>Teks Highlight / Harga</label>
            <input
              type="text"
              value={slideForm.highlight}
              onChange={(e) => setSlideForm({ ...slideForm, highlight: e.target.value })}
              placeholder="Contoh: Tersedia Rp 18.000"
            />
          </div>
        </div>

        <label>Deskripsi Singkat (Subtitle)</label>
        <textarea
          rows={3}
          value={slideForm.subtitle}
          onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
          placeholder="Kombinasi mie ayam lembut dan bakso kenyal dalam satu mangkuk..."
          required
        />

        <label>Foto Slide (URL atau Upload File Baru)</label>
        <input
          type="text"
          value={slideForm.image_url}
          onChange={(e) => setSlideForm({ ...slideForm, image_url: e.target.value })}
          placeholder="/mieayambakso.webp"
        />
        <label className="admin-upload-box">
          <FiUpload />
          <span>{slideFile ? slideFile.name : 'Pilih Foto Slide dari HP / Laptop'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSlideFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
        </label>

        <div className="admin-action-btns-row">
          <button
            type="submit"
            disabled={savingSlide}
            className="admin-save-btn btn-sweep-red-to-white"
          >
            <span>
              {savingSlide ? 'Menyimpan...' : editingSlide ? 'Simpan Slide' : 'Tambah Slide'}
            </span>
          </button>
          {editingSlide && (
            <button
              type="button"
              onClick={() => {
                setEditingSlide(null);
                setSlideForm({
                  title: '',
                  subtitle: '',
                  highlight: 'Menu Andalan',
                  badge: 'Populer',
                  image_url: '',
                });
              }}
              className="admin-cancel-btn"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-card">
        <h3>Daftar Slide Swiper Aktif ({heroSlides.length})</h3>
        <div className="admin-items-list">
          {heroSlides.map((s) => (
            <div key={s.id} className="admin-list-row">
              <img src={s.image_url} alt={s.title} className="admin-row-thumb" />
              <div className="admin-row-info">
                <strong>{s.title}</strong>
                <span>
                  🔥 {s.badge} • {s.highlight}
                </span>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlide(s);
                    setSlideForm({
                      title: s.title,
                      subtitle: s.subtitle,
                      highlight: s.highlight || '',
                      badge: s.badge || 'Populer',
                      image_url: s.image_url,
                    });
                  }}
                  className="act-edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(s.id)}
                  className="act-del"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}