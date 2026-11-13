import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiMessageSquare } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ReviewModal.css';

export default function ReviewModal({ item, isOpen, onClose, onOpenAuth, onReviewsChanged }) {
  const { user, profile, showToast } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. KUNCI LAYAR & TANGKAP TOMBOL BACK HP (BACK BUTTON HANDLER)
  useEffect(() => {
    if (isOpen) {
      // Kunci scroll latar belakang
      document.body.style.overflow = 'hidden';

      // Tambahkan history state palsu agar tombol Back HP menutup modal, bukan menutup web
      window.history.pushState({ modalOpen: true }, '');

      const handlePopState = () => {
        // Ketika tombol back HP ditekan, panggil fungsi onClose modal
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Ambil ulasan untuk menu ini dari Supabase
  useEffect(() => {
    if (!isOpen || !item) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            user_id,
            profiles ( full_name, avatar_url )
          `)
          .eq('menu_id', item.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Gagal memuat ulasan:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      if (onOpenAuth) onOpenAuth();
      else showToast('Silakan masuk terlebih dahulu untuk memberikan ulasan.', 'info');
      return;
    }

    if (!comment.trim()) {
      showToast('Mohon tuliskan komentar ulasan Anda.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        menu_id: item.id,
        user_id: user.id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (error) throw error;

      showToast('Terima kasih! Ulasan Anda berhasil dikirim.', 'success');
      setComment('');
      setRating(5);

      // Refresh data ulasan
      const { data: updated } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles ( full_name, avatar_url )
        `)
        .eq('menu_id', item.id)
        .order('created_at', { ascending: false });

      setReviews(updated || []);
      if (onReviewsChanged) onReviewsChanged();
    } catch (err) {
      showToast(`Gagal mengirim ulasan: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="review-modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="review-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tombol Tutup */}
          <button type="button" className="review-modal-close" onClick={onClose}>
            <FiX size={18} />
          </button>

          {/* Bagian Atas: Info Menu */}
          <div className="review-modal-header">
            <div className="review-modal-img-box">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="review-modal-info">
              <span className="review-modal-pill">Ulasan Pelanggan</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="review-modal-price">{item.price}</div>
            </div>
          </div>

          {/* Bagian Tengah: Form Kirim Ulasan */}
          <div className="review-form-section">
            <h4>Tulis Ulasan Anda</h4>
            {user ? (
              <form onSubmit={handleSubmitReview}>
                <div className="review-rating-picker">
                  <span>Rating:</span>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${rating >= star ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder={`Bagaimana rasa ${item.name} hari ini?`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={250}
                  required
                />

                <button type="submit" className="review-submit-btn" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </form>
            ) : (
              <div className="review-login-prompt">
                <p>Ingin ikut memberikan ulasan untuk menu ini?</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                >
                  Masuk / Daftar Akun
                </button>
              </div>
            )}
          </div>

          {/* Bagian Bawah: Daftar Ulasan Masuk */}
          <div className="review-list-section">
            <h4 className="review-list-title">
              <FiMessageSquare /> Ulasan Pelanggan Lainnya ({reviews.length})
            </h4>

            {loading ? (
              <div className="review-loading">Memuat ulasan...</div>
            ) : reviews.length === 0 ? (
              <div className="review-empty">
                Belum ada ulasan untuk menu ini. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              <div className="review-scroll-area">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-top">
                      <div className="review-user-info">
                        {rev.profiles?.avatar_url ? (
                          <img src={rev.profiles.avatar_url} alt="Avatar" />
                        ) : (
                          <div className="review-avatar-fallback">
                            {(rev.profiles?.full_name || 'P')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="review-username">
                            {rev.profiles?.full_name || 'Pelanggan Rahasia'}
                          </div>
                          <div className="review-date">
                            {new Date(rev.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="review-stars-display">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="review-comment-text">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}