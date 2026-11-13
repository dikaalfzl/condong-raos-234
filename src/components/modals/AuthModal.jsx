import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AuthModal.css';

export default function AuthModal({ isOpen, mode = 'login', onSwitchMode, onClose }) {
  const auth = useAuth();
  const showToast = auth?.showToast || ((msg) => alert(msg));

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Koneksi database Supabase belum dikonfigurasi di file .env');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim();

      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error('Nama lengkap wajib diisi.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) throw error;

        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim(),
          });
        }

        showToast('Pendaftaran berhasil! Selamat datang di Condong Raos 234.', 'success');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email atau kata sandi salah. Jika belum punya akun, silakan daftar terlebih dahulu.');
          }
          throw error;
        }

        showToast('Selamat datang kembali di Condong Raos 234!', 'success');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullpage-wrapper">
      {/* TOMBOL KEMBALI KE BERANDA */}
      <div className="auth-top-bar">
        <button type="button" onClick={onClose} className="auth-back-home-btn">
          <FiArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="auth-page-container">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-page-card"
        >
          {/* PANEL KIRI: VISUAL BRAND CONDONG RAOS */}
          <div className="auth-brand-side">
            <span className="auth-brand-pill">🍜 CONDONG RAOS 234</span>
            <h2>
              {isRegister
                ? 'Bergabung Menjadi Pelanggan Setia Kami'
                : 'Selamat Datang Kembali!'}
            </h2>
            <p>
              {isRegister
                ? 'Buat akun baru untuk memberikan ulasan menu, mengunggah foto suasana makan, dan mendapatkan info promo terbaru.'
                : 'Masuk ke akun Anda untuk menulis ulasan, berbagi foto momen bersantap, dan mengelola profil Anda.'}
            </p>
            <img
              src="/bakso.webp"
              alt="Bakso Condong Raos"
              className="auth-side-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* PANEL KANAN: FORMULIR LOGIN ATAU REGISTER */}
          <div className="auth-form-side">
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1A1A1A', marginBottom: 6 }}>
                {isRegister ? 'Halaman Daftar Akun Baru' : 'Halaman Masuk Akun'}
              </h1>
              <p style={{ fontSize: '0.86rem', color: '#555555' }}>
                {isRegister
                  ? 'Silakan lengkapi data di bawah ini untuk membuat akun.'
                  : 'Masukkan email dan kata sandi akun Anda.'}
              </p>
            </div>

            {errorMsg && (
              <div className="auth-page-error">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-page-form">
              {isRegister && (
                <div className="auth-page-field">
                  <label>Nama Lengkap</label>
                  <div className="auth-input-wrap">
                    <FiUser className="field-icon" />
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-page-field">
                <label>Alamat Email</label>
                <div className="auth-input-wrap">
                  <FiMail className="field-icon" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-page-field">
                <label>Kata Sandi</label>
                <div className="auth-input-wrap">
                  <FiLock className="field-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="pass-eye-btn"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-page-submit btn-sweep-red-to-white"
              >
                <span>
                  {loading
                    ? 'Memproses...'
                    : isRegister
                    ? 'Daftar Akun Sekarang'
                    : 'Masuk ke Akun'}
                </span>
              </button>
            </form>

            {/* NAVIGASI PINDAH KE HALAMAN DAFTAR / HALAMAN LOGIN */}
            <div className="auth-switch-box">
              {isRegister ? (
                <>
                  <span>Sudah punya akun pelanggan?</span>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('login')}
                    className="auth-switch-btn"
                  >
                    Buka Halaman Masuk
                  </button>
                </>
              ) : (
                <>
                  <span>Belum punya akun pelanggan?</span>
                  <button
                    type="button"
                    onClick={() => onSwitchMode('register')}
                    className="auth-switch-btn"
                  >
                    Daftar Akun Dulu di Sini
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .auth-fullpage-wrapper {
          min-height: 100vh;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          padding: 24px 16px 48px;
        }
        .auth-top-bar {
          max-width: 960px;
          width: 100%;
          margin: 0 auto 20px;
        }
        .auth-back-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          background: #1A1A1A;
          color: #FFC72C;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
        }
        .auth-page-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-page-card {
          max-width: 960px;
          width: 100%;
          background: #FFFFFF;
          border-radius: 32px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.12);
          border: 2px solid #F0F0F0;
        }
        .auth-brand-side {
          background: #9a1006;
          color: #FFFFFF;
          padding: 40px 34px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .auth-brand-pill {
          display: inline-block;
          align-self: flex-start;
          padding: 6px 14px;
          border-radius: 999px;
          background: #FFC72C;
          color: #1A1A1A;
          font-size: 0.72rem;
          font-weight: 900;
          margin-bottom: 18px;
        }
        .auth-brand-side h2 {
          font-size: 1.7rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        .auth-brand-side p {
          font-size: 0.88rem;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .auth-side-img {
          width: 100%;
          height: 210px;
          object-fit: cover;
          border-radius: 22px;
          border: 3px solid #FFC72C;
        }
        .auth-form-side {
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .auth-page-error {
          padding: 12px 16px;
          border-radius: 12px;
          background: #FDEDEC;
          color: #9a1006;
          font-size: 0.84rem;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .auth-page-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-page-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 800;
          color: #1A1A1A;
          margin-bottom: 6px;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          color: #9a1006;
          font-size: 17px;
        }
        .auth-input-wrap input {
          width: 100%;
          padding: 13px 42px 13px 42px;
          border-radius: 14px;
          border: 2px solid #E5E5E5;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1A1A1A;
        }
        .auth-input-wrap input:focus {
          outline: none;
          border-color: #9a1006;
        }
        .pass-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          color: #666666;
          font-size: 18px;
          cursor: pointer;
        }
        .auth-page-submit {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          font-size: 0.92rem;
          font-weight: 800;
          margin-top: 6px;
          cursor: pointer;
        }
        .auth-switch-box {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #EEEEEE;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1A1A1A;
        }
        .auth-switch-btn {
          padding: 9px 18px;
          border-radius: 999px;
          background: #FFC72C;
          color: #1A1A1A;
          font-weight: 900;
          font-size: 0.82rem;
          cursor: pointer;
        }
        @media (max-width: 780px) {
          .auth-page-card {
            grid-template-columns: 1fr;
            border-radius: 26px;
          }
          .auth-brand-side {
            padding: 26px 22px;
          }
          .auth-side-img {
            display: none;
          }
          .auth-form-side {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
}