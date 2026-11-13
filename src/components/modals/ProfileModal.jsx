import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiEdit2,
  FiUpload,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiZoomIn,
  FiZoomOut,
  FiMove,
} from "react-icons/fi";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { useAuth } from '../../context/AuthContext';
import '../../styles/ProfileModal.css';

const INITIAL_HISTORY_LIMIT = 2;
const CROP_VIEW_SIZE = 240; // Ukuran area crop di layar (px)
const OUTPUT_AVATAR_SIZE = 400; // Resolusi hasil crop yang disimpan (400x400 px)

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user, profile, isAdmin, refreshProfile, showToast } = useAuth();
  const [editing, setEditing] = useState(true);
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // State khusus Crop Foto Interaktif
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 1, height: 1 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cropImgRef = useRef(null);

  const [myReviews, setMyReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const fallbackName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "";
    const fallbackAvatar =
      profile?.avatar_url || user?.user_metadata?.avatar_url || null;

    setFullName(fallbackName);
    setAvatarPreview(fallbackAvatar);
  }, [profile, user, isOpen]);

  const fetchMyReviews = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          menus ( name )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMyReviews(data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat ulasan:", err.message);
    } finally {
      setLoadingReviews(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      setEditing(true);
      setShowAllReviews(false);
      fetchMyReviews();
    }
  }, [isOpen, user, fetchMyReviews]);

  if (!isOpen || !user) return null;

  // Saat pengguna memilih file foto, buka jendela Crop terlebih dahulu
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 8 MB.", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleCropImageLoaded = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgNaturalSize({
      width: naturalWidth || 1,
      height: naturalHeight || 1,
    });
  };

  // Hitung skala dasar agar gambar menutupi lingkaran crop (object-fit: cover)
  const baseScale = Math.max(
    CROP_VIEW_SIZE / imgNaturalSize.width,
    CROP_VIEW_SIZE / imgNaturalSize.height,
  );
  const renderedWidth = imgNaturalSize.width * baseScale * cropZoom;
  const renderedHeight = imgNaturalSize.height * baseScale * cropZoom;

  // Handler geser foto (Drag dengan Mouse atau Sentuhan Jari di HP)
  const handlePointerDown = (clientX, clientY) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - cropOffset.x,
      y: clientY - cropOffset.y,
    };
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!isDragging) return;
    const maxOffsetX = Math.max(0, (renderedWidth - CROP_VIEW_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - CROP_VIEW_SIZE) / 2);

    const nextX = Math.min(
      maxOffsetX,
      Math.max(-maxOffsetX, clientX - dragStartRef.current.x),
    );
    const nextY = Math.min(
      maxOffsetY,
      Math.max(-maxOffsetY, clientY - dragStartRef.current.y),
    );

    setCropOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Proses memotong gambar menggunakan HTML5 Canvas menjadi file 400x400px
  const handleApplyCrop = async () => {
    if (!cropImgRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_AVATAR_SIZE;
    canvas.height = OUTPUT_AVATAR_SIZE;
    const ctx = canvas.getContext("2d");

    const ratio = OUTPUT_AVATAR_SIZE / CROP_VIEW_SIZE;
    const drawW = renderedWidth * ratio;
    const drawH = renderedHeight * ratio;
    const drawX = (OUTPUT_AVATAR_SIZE - drawW) / 2 + cropOffset.x * ratio;
    const drawY = (OUTPUT_AVATAR_SIZE - drawH) / 2 + cropOffset.y * ratio;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, OUTPUT_AVATAR_SIZE, OUTPUT_AVATAR_SIZE);
    ctx.drawImage(cropImgRef.current, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], `avatar-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(blob);
        setAvatarFile(croppedFile);
        setAvatarPreview(previewUrl);
        setCropModalOpen(false);
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Nama lengkap tidak boleh kosong.", "error");
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl =
        profile?.avatar_url || user?.user_metadata?.avatar_url || null;

      if (avatarFile && supabase) {
        const filePath = `avatars/${user.id}-${Date.now()}.jpg`;

        // Utamakan unggah ke bucket store-images yang sudah dipakai untuk foto suasana
        const { error: uploadErr } = await supabase.storage
          .from("store-images")
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: "image/jpeg",
          });

        if (!uploadErr) {
          const { data: pubData } = supabase.storage
            .from("store-images")
            .getPublicUrl(filePath);
          finalAvatarUrl = pubData.publicUrl;
        } else {
          // Fallback ke bucket avatars jika ada
          const { error: avatarBucketErr } = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, {
              upsert: true,
              contentType: "image/jpeg",
            });

          if (avatarBucketErr) throw uploadErr;
          const { data: pubData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          finalAvatarUrl = pubData.publicUrl;
        }
      }

      // 1. Simpan juga ke Auth Metadata (selalu berhasil untuk user yang login tanpa terhalang RLS)
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl,
        },
      });

      // 2. Cek apakah baris profil sudah ada di tabel profiles
      const { data: existingRow } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existingRow?.id) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            avatar_url: finalAvatarUrl,
          })
          .eq("id", user.id);

        if (updateErr) {
          console.warn("Info RLS update profiles:", updateErr.message);
        }
      } else {
        const { error: insertErr } = await supabase.from("profiles").insert({
          id: user.id,
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl,
        });

        if (insertErr) {
          console.warn("Info RLS insert profiles:", insertErr.message);
        }
      }

      if (refreshProfile) await refreshProfile();
      if (onProfileUpdated) onProfileUpdated();
      setAvatarFile(null);
      showToast("Foto & profil berhasil disimpan!", "success");
    } catch (err) {
      showToast(err.message || "Gagal menyimpan profil.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMyReview = async (reviewId) => {
    if (!window.confirm("Hapus ulasan Anda ini?")) return;
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
      showToast("Ulasan berhasil dihapus.", "info");
      fetchMyReviews();
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const displayName =
    fullName ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Pelanggan";

  const displayedReviews = showAllReviews
    ? myReviews
    : myReviews.slice(0, INITIAL_HISTORY_LIMIT);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="profile-modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="profile-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER MAROON */}
          <div className="profile-modal-header">
            <div>
              <h2>Profil & Pengaturan Akun</h2>
              <p>{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="profile-modal-close"
              aria-label="Tutup"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* BODY SCROLLABLE DI DALAM KARTU */}
          <div className="profile-modal-body">
            <div className="profile-top-summary">
              <div className="profile-avatar-circle">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={displayName} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="profile-user-meta">
                <h3>{displayName}</h3>
                <div className="profile-role-badge">
                  Status Akun:{" "}
                  <strong>
                    {isAdmin ? "ADMIN CONDONG RAOS" : "PELANGGAN SETIA"}
                  </strong>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="profile-edit-trigger btn-sweep-red-to-white"
                  >
                    <FiEdit2 size={13} />
                    <span>Buka Edit Profil</span>
                  </button>
                )}
              </div>
            </div>

            {/* MODAL INTERAKTIF CROP FOTO PROFIL */}
            {cropModalOpen && rawImageSrc && (
              <div className="crop-box-container">
                <div className="crop-box-title">
                  <span>✂️ Geser & Sesuaikan Posisi Foto</span>
                  <small>
                    <FiMove size={12} /> Geser gambar dengan jari/mouse
                  </small>
                </div>

                <div
                  className="crop-viewport-circle"
                  onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                  onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={(e) => {
                    const t = e.touches[0];
                    handlePointerDown(t.clientX, t.clientY);
                  }}
                  onTouchMove={(e) => {
                    const t = e.touches[0];
                    handlePointerMove(t.clientX, t.clientY);
                  }}
                  onTouchEnd={handlePointerUp}
                >
                  <img
                    ref={cropImgRef}
                    src={rawImageSrc}
                    alt="Crop Preview"
                    onLoad={handleCropImageLoaded}
                    draggable={false}
                    style={{
                      width: `${renderedWidth}px`,
                      height: `${renderedHeight}px`,
                      transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                    }}
                    className="crop-draggable-img"
                  />
                </div>

                {/* SLIDER ZOOM */}
                <div className="crop-zoom-row">
                  <FiZoomOut size={16} color="#666" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => {
                      setCropZoom(parseFloat(e.target.value));
                      setCropOffset({ x: 0, y: 0 });
                    }}
                    className="crop-zoom-slider"
                  />
                  <FiZoomIn size={16} color="#9a1006" />
                </div>

                <div className="crop-action-btns">
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="profile-save-btn btn-sweep-red-to-white"
                  >
                    <FiCheck />
                    <span>Gunakan Foto Ini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropModalOpen(false)}
                    className="profile-cancel-btn"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* FORM EDIT PROFIL */}
            {editing && !cropModalOpen && (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <div className="profile-form-field">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div className="profile-form-field">
                  <label className="profile-field-label">
                    Ganti & Crop Foto Profil (Opsional)
                  </label>
                  <label className="profile-upload-btn">
                    <span className="upload-icon-badge">
                      <FiUpload size={15} />
                    </span>
                    <span className="upload-btn-text">
                      {avatarFile
                        ? "Foto Siap Disimpan (Klik untuk Ganti Lagi)"
                        : "Pilih & Potong Foto Baru"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div className="profile-edit-actions">
                  <button
                    type="submit"
                    disabled={saving}
                    className="profile-save-btn btn-sweep-red-to-white"
                  >
                    <FiCheck />
                    <span>
                      {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="profile-cancel-btn"
                  >
                    Tutup
                  </button>
                </div>
              </form>
            )}

            {/* RIWAYAT ULASAN RINGKAS */}
            <div className="profile-reviews-section">
              <div className="profile-reviews-header">
                <h4>⭐ Riwayat Ulasan & Rating Saya ({myReviews.length})</h4>
              </div>

              {loadingReviews ? (
                <div className="profile-reviews-empty">Memuat ulasan...</div>
              ) : myReviews.length === 0 ? (
                <div className="profile-reviews-empty">
                  Anda belum memberikan ulasan pada menu apa pun.
                </div>
              ) : (
                <>
                  <div className="profile-reviews-list">
                    {displayedReviews.map((rev) => (
                      <div key={rev.id} className="profile-review-item">
                        <div className="profile-review-top">
                          <div>
                            <strong className="profile-review-menu">
                              {rev.menus?.name || "Menu Condong Raos"}
                            </strong>
                            <div className="profile-review-stars">
                              {"★".repeat(rev.rating)}
                            </div>
                          </div>

                          <div className="profile-review-right">
                            <span className="profile-review-date">
                              {new Date(rev.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteMyReview(rev.id)}
                              className="profile-review-del"
                              title="Hapus ulasan"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="profile-review-comment">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {myReviews.length > INITIAL_HISTORY_LIMIT && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((prev) => !prev)}
                      className="profile-toggle-reviews-btn"
                    >
                      {showAllReviews ? (
                        <>
                          <FiChevronUp /> Sembunyikan Sebagian Ulasan
                        </>
                      ) : (
                        <>
                          <FiChevronDown /> Lihat Semua Ulasan (
                          {myReviews.length - INITIAL_HISTORY_LIMIT} lainnya)
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
