import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiTrash2,
  FiEdit2,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiCornerDownRight,
} from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import '../../styles/ReviewModal.css';

export default function ReviewModal({
  item,
  menu,
  isOpen,
  onClose,
  onOpenAuth,
  onReviewsChanged,
  onReviewSubmitted,
}) {
  const activeItem = item || menu;
  const { user, isAdmin, showToast, isSupabaseConfigured } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // State form ulasan pelanggan
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // --- TAMBAHKAN KODE INI DI SINI ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // State khusus Admin untuk membalas langsung dari modal
  const [openReplyBoxId, setOpenReplyBoxId] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);

  const fetchMenuReviews = useCallback(async () => {
    if (!activeItem || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          user_id,
          menu_id,
          rating,
          comment,
          created_at,
          updated_at,
          profiles ( full_name, avatar_url ),
          review_replies ( id, reply, admin_id, created_at, updated_at )
        `,
        )
        .eq("menu_id", activeItem.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
    } catch (err) {
      console.error("Gagal mengambil ulasan:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeItem]);

  useEffect(() => {
    if (isOpen && activeItem) {
      fetchMenuReviews();
      setEditingReviewId(null);
      setOpenReplyBoxId(null);
      setRating(5);
      setComment("");
    }
  }, [isOpen, activeItem, fetchMenuReviews]);

  if (!isOpen || !activeItem) return null;

  const myExistingReview = user
    ? reviews.find((r) => String(r.user_id) === String(user.id))
    : null;

  const notifyParentRefresh = () => {
    if (onReviewsChanged) onReviewsChanged();
    if (onReviewSubmitted) onReviewSubmitted();
  };

  const formatFriendlyError = (err) => {
    const rawMsg = (err?.message || "").toLowerCase();
    if (
      err?.code === "23505" ||
      rawMsg.includes("unique_user_menu_review") ||
      rawMsg.includes("duplicate key")
    ) {
      return "Anda sudah pernah mengulas menu ini. Setiap pelanggan hanya dapat mengirim 1 ulasan per menu.";
    }
    if (
      rawMsg.includes("row-level security") ||
      rawMsg.includes("permission")
    ) {
      return "Sesi akun Anda telah berakhir. Silakan masuk kembali.";
    }
    return err?.message || "Maaf, terjadi kendala saat menyimpan data.";
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    const cleanComment = comment.trim();
    if (cleanComment.length < 3) {
      showToast(
        "Ulasan terlalu singkat, mohon tulis minimal 3 karakter.",
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      const targetEditId = editingReviewId || myExistingReview?.id;

      if (targetEditId) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: cleanComment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetEditId)
          .eq("user_id", user.id);

        if (error) throw error;
        showToast("Ulasan Anda berhasil diperbarui!", "success");
      } else {
        const { error } = await supabase.from("reviews").insert({
          user_id: user.id,
          menu_id: activeItem.id,
          rating,
          comment: cleanComment,
        });

        if (error) throw error;
        showToast("Terima kasih! Ulasan Anda berhasil dikirim.", "success");
      }

      setComment("");
      setRating(5);
      setEditingReviewId(null);
      await fetchMenuReviews();
      notifyParentRefresh();
    } catch (err) {
      showToast(formatFriendlyError(err), "info");
      await fetchMenuReviews();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (rev) => {
    setEditingReviewId(rev.id);
    setRating(rev.rating);
    setComment(rev.comment);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Hapus ulasan ini?")) return;
    try {
      let query = supabase.from("reviews").delete().eq("id", reviewId);
      // Jika bukan admin, hanya boleh menghapus milik sendiri
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { error } = await query;
      if (error) throw error;

      showToast("Ulasan berhasil dihapus.", "info");
      setEditingReviewId(null);
      setComment("");
      await fetchMenuReviews();
      notifyParentRefresh();
    } catch (err) {
      showToast("Gagal menghapus ulasan, silakan coba lagi.", "error");
    }
  };

  // === FUNGSI BALAS ULASAN LANGSUNG DARI MODAL (KHUSUS ADMIN) ===
  const handleAdminReplySubmit = async (reviewId, existingReplyObj) => {
    if (!user || !isAdmin) return;
    const text = (replyTextMap[reviewId] ?? "").trim();
    if (!text) {
      showToast("Tulis isi balasan terlebih dahulu.", "error");
      return;
    }

    setSendingReplyId(reviewId);
    try {
      if (existingReplyObj?.id) {
        // Update balasan yang sudah ada
        const { error } = await supabase
          .from("review_replies")
          .update({
            reply: text,
            admin_id: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReplyObj.id);

        if (error) throw error;
      } else {
        // Insert balasan baru lengkap dengan admin_id agar tidak kena not-null constraint
        const { error } = await supabase.from("review_replies").insert({
          review_id: reviewId,
          admin_id: user.id,
          reply: text,
        });

        if (error) throw error;
      }

      showToast("Balasan Admin berhasil disimpan!", "success");
      setOpenReplyBoxId(null);
      await fetchMenuReviews();
      notifyParentRefresh();
    } catch (err) {
      showToast(`Gagal menyimpan balasan: ${err.message}`, "error");
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleDeleteAdminReply = async (replyId) => {
    if (!window.confirm("Hapus balasan admin ini?")) return;
    try {
      const { error } = await supabase
        .from("review_replies")
        .delete()
        .eq("id", replyId);
      if (error) throw error;

      showToast("Balasan Admin dihapus.", "info");
      await fetchMenuReviews();
      notifyParentRefresh();
    } catch (err) {
      showToast(`Gagal menghapus balasan: ${err.message}`, "error");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="review-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BANNER */}
        <div className="review-menu-banner">
          <img
            src={activeItem.image}
            alt={activeItem.name}
            className="review-menu-thumb"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 2 }}
            >
              {activeItem.name}
            </h3>
            <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: 4 }}>
              {activeItem.price}
            </div>
            <div
              style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFC72C" }}
            >
              {avgRating
                ? `★ ${avgRating} (${reviews.length} ulasan pelanggan)`
                : "Belum ada ulasan"}
            </div>
          </div>
        </div>

        <div className="review-body">
          {/* AREA FORM ULASAN */}
          {!user ? (
            <div
              style={{
                padding: "18px 20px",
                borderRadius: 16,
                background: "#FEF5F5",
                border: "1px solid #FDEDEC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.88rem",
                  color: "#2D2D2D",
                  fontWeight: 600,
                }}
              >
                Ingin memberikan rating dan komentar untuk menu ini?
              </span>
              <button
                type="button"
                className="btn-primary-red btn-sweep-red-to-white"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                <span>Masuk Pelanggan</span>
              </button>
            </div>
          ) : myExistingReview && !editingReviewId ? (
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                background: "#FEF5F5",
                border: "1.5px solid #FDEDEC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FiCheckCircle
                  size={20}
                  color="#9a1006"
                  style={{ flexShrink: 0 }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 800,
                      color: "#1A1A1A",
                    }}
                  >
                    Terima kasih, Anda sudah mengulas menu ini!
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666666" }}>
                    Ingin mengubah rating atau isi komentar Anda? Klik tombol di
                    samping.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartEdit(myExistingReview)}
                className="btn-primary-red btn-sweep-red-to-white"
                style={{
                  flex: "0 0 auto",
                  padding: "9px 16px",
                  fontSize: "0.8rem",
                }}
              >
                <FiEdit2 size={13} />
                <span>Ubah Ulasan Saya</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitReview}
              style={{
                padding: 16,
                borderRadius: 16,
                background: "#FAFAFA",
                border: "1px solid #E8E8E8",
              }}
            >
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#1A1A1A",
                }}
              >
                {editingReviewId
                  ? "✏️ Ubah Ulasan Anda"
                  : "⭐ Berikan Rating & Ulasan"}
              </div>

              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? "active" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="review-textarea"
                placeholder={`Bagaimana rasa ${activeItem.name}? Tulis pengalaman Anda di sini...`}
                maxLength={300}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  className="btn-primary-red btn-sweep-red-to-white"
                  disabled={submitting || !isSupabaseConfigured}
                >
                  <FiSend size={14} />
                  <span>
                    {submitting
                      ? "Menyimpan..."
                      : editingReviewId
                        ? "Simpan Perubahan"
                        : "Kirim Ulasan"}
                  </span>
                </button>
                {editingReviewId && (
                  <button
                    type="button"
                    className="btn-secondary-gray"
                    onClick={() => {
                      setEditingReviewId(null);
                      setComment("");
                      setRating(5);
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          )}

          {/* DAFTAR ULASAN PELANGGAN */}
          <div className="reviews-list">
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#1A1A1A",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FiMessageSquare /> Ulasan Pelanggan ({reviews.length})
            </h4>

            {loading ? (
              <p style={{ fontSize: "0.85rem", color: "#6B6B6B" }}>
                Memuat ulasan...
              </p>
            ) : reviews.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#6B6B6B" }}>
                Belum ada ulasan untuk menu ini. Jadilah yang pertama memberikan
                ulasan!
              </p>
            ) : (
              reviews.map((rev) => {
                const reviewerName = rev.profiles?.full_name || "Pelanggan";
                const reviewerAvatar = rev.profiles?.avatar_url;
                const isOwnReview =
                  user && String(user.id) === String(rev.user_id);
                const canDeleteReview = isOwnReview || isAdmin;
                const replyObj = Array.isArray(rev.review_replies)
                  ? rev.review_replies[0]
                  : rev.review_replies;
                const isReplyingThis = openReplyBoxId === rev.id;

                return (
                  <div key={rev.id} className="review-item-card">
                    <div className="reviewer-header">
                      <div className="reviewer-info">
                        {reviewerAvatar ? (
                          <img
                            src={reviewerAvatar}
                            alt={reviewerName}
                            className="reviewer-avatar"
                          />
                        ) : (
                          <div className="reviewer-avatar">
                            {reviewerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "#1A1A1A",
                            }}
                          >
                            {reviewerName}
                          </div>
                          <div
                            style={{ fontSize: "0.73rem", color: "#6B6B6B" }}
                          >
                            {new Date(rev.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: "#F39C12", fontWeight: 800 }}>
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                        {isOwnReview && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(rev)}
                            title="Ubah ulasan saya"
                            style={{
                              color: "#1A1A1A",
                              fontSize: 15,
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDeleteReview && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Hapus ulasan"
                            style={{
                              color: "#9a1006",
                              fontSize: 15,
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "#2D2D2D",
                        lineHeight: 1.55,
                      }}
                    >
                      {rev.comment}
                    </p>

                    {/* TAMPILAN BALASAN ADMIN */}
                    {replyObj && (
                      <div className="admin-reply-box">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: "#9a1006",
                            }}
                          >
                            Balasan Admin Condong Raos 234
                          </div>

                          {isAdmin && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenReplyBoxId(rev.id);
                                  setReplyTextMap((prev) => ({
                                    ...prev,
                                    [rev.id]: replyObj.reply,
                                  }));
                                }}
                                style={{
                                  background: "none",
                                  color: "#1A1A1A",
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAdminReply(replyObj.id)
                                }
                                style={{
                                  background: "none",
                                  color: "#9a1006",
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: "0.84rem",
                            color: "#2D2D2D",
                            margin: 0,
                          }}
                        >
                          {replyObj.reply}
                        </p>
                      </div>
                    )}

                    {/* FITUR BALAS LANGSUNG UNTUK ADMIN TANPA PERLU KE DASHBOARD */}
                    {isAdmin && (
                      <div style={{ marginTop: 10 }}>
                        {!isReplyingThis ? (
                          !replyObj && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenReplyBoxId(rev.id);
                                setReplyTextMap((prev) => ({
                                  ...prev,
                                  [rev.id]: "",
                                }));
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 12px",
                                borderRadius: 999,
                                background: "#1A1A1A",
                                color: "#FFC72C",
                                fontSize: "0.74rem",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              <FiCornerDownRight size={13} />
                              <span>Balas Ulasan Ini</span>
                            </button>
                          )
                        ) : (
                          <div
                            style={{
                              marginTop: 8,
                              padding: 12,
                              borderRadius: 12,
                              background: "#FFFFFF",
                              border: "1.5px solid #9a1006",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <textarea
                              rows={2}
                              placeholder="Tulis balasan Admin Condong Raos..."
                              value={replyTextMap[rev.id] ?? ""}
                              onChange={(e) =>
                                setReplyTextMap((prev) => ({
                                  ...prev,
                                  [rev.id]: e.target.value,
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid #DDDDDD",
                                fontSize: "0.82rem",
                                fontFamily: "inherit",
                                boxSizing: "border-box",
                              }}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                type="button"
                                disabled={sendingReplyId === rev.id}
                                onClick={() =>
                                  handleAdminReplySubmit(rev.id, replyObj)
                                }
                                className="btn-primary-red btn-sweep-red-to-white"
                                style={{
                                  padding: "8px 14px",
                                  fontSize: "0.78rem",
                                }}
                              >
                                <FiSend size={12} />
                                <span>
                                  {sendingReplyId === rev.id
                                    ? "Menyimpan..."
                                    : "Kirim Balasan"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setOpenReplyBoxId(null)}
                                className="btn-secondary-gray"
                                style={{
                                  padding: "8px 14px",
                                  fontSize: "0.78rem",
                                }}
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
