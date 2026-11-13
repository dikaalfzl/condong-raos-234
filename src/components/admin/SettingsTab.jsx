import { useState, useEffect } from 'react';
import { FiPower, FiBell, FiCheckCircle } from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function SettingsTab({ onDataUpdated }) {
  const { storeStatus, updateStoreStatus, showToast } = useAuth();
  const [isOpenStore, setIsOpenStore] = useState(true);
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (storeStatus) {
      setIsOpenStore(storeStatus.is_open !== false);
      setAnnouncementActive(Boolean(storeStatus.announcement_active));
      setAnnouncementText(storeStatus.announcement_text || '');
    }
  }, [storeStatus]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        id: 1,
        is_open: Boolean(isOpenStore),
        announcement_active: Boolean(announcementActive),
        announcement_text: announcementText.trim(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('store_settings')
          .upsert(payload, { onConflict: 'id' });
        if (error) throw error;
      }

      if (typeof updateStoreStatus === 'function') {
        try {
          await updateStoreStatus({
            is_open: payload.is_open,
            announcement_active: payload.announcement_active,
            announcement_text: payload.announcement_text,
          });
        } catch (_) {}
      }

      showToast('Pengaturan status toko & promo berhasil disimpan!', 'success');
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      showToast(
        `Gagal menyimpan pengaturan: ${err.message || 'Periksa izin tabel store_settings'}`,
        'error'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <form onSubmit={handleSaveSettings} className="status-promo-container">
      <div className="status-promo-header">
        <div>
          <h3>⚡ Pengaturan Status Operasional & Promo Banner</h3>
          <p>
            Atur status buka/tutup warung secara real-time dan tampilkan pengumuman spesial di
            halaman utama.
          </p>
        </div>
      </div>

      <div className="status-cards-grid">
        <div
          onClick={() => setIsOpenStore(!isOpenStore)}
          className={`interactive-toggle-card ${
            isOpenStore ? 'active-open' : 'active-closed'
          }`}
        >
          <div className="toggle-card-top">
            <div className="toggle-icon-box">
              <FiPower size={22} />
            </div>
            <div className={`modern-switch ${isOpenStore ? 'on' : 'off'}`}>
              <div className="switch-knob" />
            </div>
          </div>

          <div className="toggle-card-body">
            <span className="toggle-status-pill">
              {isOpenStore ? '● TOKO SEDANG BUKA' : '● TOKO SEDANG TUTUP'}
            </span>
            <h4>Status Operasional Warung</h4>
            <p>
              {isOpenStore
                ? 'Pelanggan melihat bahwa warung siap melayani pesanan saat ini.'
                : 'Pelanggan melihat pengumuman bahwa warung sedang tutup sementara.'}
            </p>
          </div>
        </div>

        <div
          onClick={() => setAnnouncementActive(!announcementActive)}
          className={`interactive-toggle-card ${announcementActive ? 'active-promo' : ''}`}
        >
          <div className="toggle-card-top">
            <div className="toggle-icon-box promo">
              <FiBell size={22} />
            </div>
            <div className={`modern-switch ${announcementActive ? 'on' : 'off'}`}>
              <div className="switch-knob" />
            </div>
          </div>

          <div className="toggle-card-body">
            <span className="toggle-status-pill promo">
              {announcementActive ? '📢 BANNER PROMO AKTIF' : '🔕 BANNER DISEMBUNYIKAN'}
            </span>
            <h4>Banner Promo di Atas Hero</h4>
            <p>
              Aktifkan untuk menampilkan pita pengumuman spesial atau diskon di bagian paling
              atas halaman utama.
            </p>
          </div>
        </div>
      </div>

      <div className="promo-editor-card">
        <label>📝 Isi Teks Promo / Pengumuman</label>
        <textarea
          rows={3}
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="Contoh: Promo Spesial Condong Raos 234: Nikmati Bakso Asli Solo & Mie Ayam hangat bersama keluarga!"
        />

        <div className="live-preview-box">
          <div className="live-preview-label">
            <FiCheckCircle /> PRATINJAU TAMPILAN DI BERANDA SAAT INI:
          </div>

          <div className={`preview-status-pill ${isOpenStore ? 'open' : 'closed'}`}>
            <span className="dot" />
            <span>
              Status Operasional:{' '}
              <strong>
                {isOpenStore
                  ? 'BUKA — Siap Melayani Pesanan Anda'
                  : 'TUTUP — Buka Kembali di Jam Operasional'}
              </strong>
            </span>
          </div>

          {announcementActive && (
            <div className="preview-promo-bar">
              <span className="tag">✨ INFO & PROMO SPESIAL</span>
              <span>{announcementText || 'Teks pengumuman akan tampil di sini...'}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="admin-save-btn btn-sweep-red-to-white"
        >
          <span>
            {savingSettings
              ? 'Menyimpan Pengaturan...'
              : 'Simpan Pengaturan Toko Sekarang'}
          </span>
        </button>
      </div>
    </form>
  );
}