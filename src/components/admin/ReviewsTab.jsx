import { useState } from 'react';
import { FiTrash2, FiSend, FiCornerDownRight } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function ReviewsTab({ reviews, onRefresh }) {
  const { user, showToast } = useAuth();
  const [replyTextMap, setReplyTextMap] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const handleSendReply = async (reviewId) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text || !user) {
      showToast('Tulis balasan terlebih dahulu.', 'error');
      return;
    }

    setSendingId(reviewId);
    try {
      const { data: existing } = await supabase
        .from('review_replies')
        .select('id')
        .eq('review_id', reviewId)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('review_replies')
          .update({
            reply: text,
            admin_id: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('review_replies').insert({
          review_id: reviewId,
          admin_id: user.id,
          reply: text,
        });
        if (error) throw error;
      }

      showToast('Balasan ulasan berhasil disimpan!', 'success');
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
      onRefresh();
    } catch (err) {
      showToast(`Gagal mengirim balasan: ${err.message}`, 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Hapus ulasan pelanggan ini?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    showToast('Ulasan dihapus.', 'info');
    onRefresh();
  };

  return (
    <div className="admin-list-card">
      <h3>Semua Ulasan Pelanggan ({reviews.length})</h3>
      <div className="admin-items-list">
        {reviews.map((r) => {
          const existingReply = Array.isArray(r.review_replies)
            ? r.review_replies[0]?.reply
            : r.review_replies?.reply;
          const reviewerName = r.profiles?.full_name || 'Pelanggan';

          return (
            <div key={r.id} className="cr-review-card">
              {/* HEADER KARTU ULASAN: NAMA DI KIRI, TOMBOL HAPUS SELALU DI KANAN ATAS */}
              <div className="cr-review-header">
                <div className="cr-reviewer-meta">
                  <div className="cr-reviewer-avatar">
                    {reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="cr-reviewer-text">
                    <div className="cr-reviewer-title-line">
                      <strong className="cr-reviewer-name">{reviewerName}</strong>
                      <span className="cr-menu-badge">
                        {r.menus?.name || 'Menu'}
                      </span>
                    </div>
                    <div className="cr-review-stars">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteReview(r.id)}
                  className="cr-review-del-btn"
                  title="Hapus ulasan ini"
                >
                  <FiTrash2 size={14} />
                  <span>Hapus</span>
                </button>
              </div>

              {/* ISI KOMENTAR PELANGGAN */}
              <div className="cr-review-comment-bubble">"{r.comment}"</div>

              {/* TAMPILKAN BALASAN ADMIN SAAT INI JIKA SUDAH ADA */}
              {existingReply && (
                <div className="cr-existing-reply-box">
                  <FiCornerDownRight size={14} className="reply-icon" />
                  <div>
                    <span>Balasan Admin Saat Ini:</span>
                    <p>{existingReply}</p>
                  </div>
                </div>
              )}

              {/* INPUT BALASAN BARU / UBAH BALASAN */}
              <div className="cr-reply-form-row">
                <input
                  type="text"
                  placeholder={
                    existingReply
                      ? 'Ketik untuk mengubah balasan admin...'
                      : 'Tulis balasan admin...'
                  }
                  value={replyTextMap[r.id] ?? ''}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [r.id]: e.target.value })
                  }
                  className="cr-reply-input"
                />
                <button
                  type="button"
                  disabled={sendingId === r.id}
                  onClick={() => handleSendReply(r.id)}
                  className="cr-reply-send-btn btn-sweep-red-to-white"
                >
                  <FiSend size={13} />
                  <span>
                    {sendingId === r.id
                      ? 'Mengirim...'
                      : existingReply
                      ? 'Ubah Balasan'
                      : 'Kirim Balasan'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}