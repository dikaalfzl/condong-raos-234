import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import '../../styles/TestimonialSection.css';

const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-1",
    name: "Pelanggan Setia",
    avatar: null,
    menuName: "Bakso Asli Solo",
    rating: 5,
    comment: "Kuahnya segar dan gurih banget, baksonya terasa daging sapinya!",
    date: "Pelanggan Terverifikasi",
  },
  {
    id: "fallback-2",
    name: "Pecinta Kuliner",
    avatar: null,
    menuName: "Mie Ayam Bakso",
    rating: 5,
    comment: "Porsinya pas, mie ayamnya lembut dan bumbunya meresap sempurna.",
    date: "Pelanggan Terverifikasi",
  },
];

const HOME_PREVIEW_COUNT = 4;

export default function TestimonialSection({
  refreshTrigger,
  onOpenAllReviews,
}) {
  const [reviewsList, setReviewsList] = useState([]);

  const fetchTopReviews = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setReviewsList(FALLBACK_TESTIMONIALS);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          profiles ( full_name, avatar_url ),
          menus ( name )
        `,
        )
        .gte("rating", 4)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((r) => ({
          id: r.id,
          name: r.profiles?.full_name || "Pelanggan Setia",
          avatar: r.profiles?.avatar_url || null,
          menuName: r.menus?.name || "Menu Condong Raos",
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }));
        setReviewsList(mapped);
      } else {
        setReviewsList(FALLBACK_TESTIMONIALS);
      }
    } catch (err) {
      setReviewsList(FALLBACK_TESTIMONIALS);
    }
  }, []);

  useEffect(() => {
    fetchTopReviews();
  }, [fetchTopReviews, refreshTrigger]);

  const displayedList = reviewsList.slice(0, HOME_PREVIEW_COUNT);

  return (
    <section className="testi-section">
      <div className="testi-container">
        <div className="testi-header">
          <span className="testi-badge">★ KATA PELANGGAN KAMI</span>
          <h2 className="testi-title font-brighly">Ulasan Terbaik Pelanggan</h2>
          <p className="testi-subtitle">
            Pengalaman nyata dari pelanggan setia Bakso & Mie Ayam Condong Raos
            234.
          </p>
        </div>

        <div className="testi-grid">
          {displayedList.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="testi-card"
            >
              <div>
                <div className="testi-user-row">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="testi-avatar-img"
                    />
                  ) : (
                    <div className="testi-avatar-fallback">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="testi-user-meta">
                    <h4>{item.name}</h4>
                    {item.menuName && (
                      <div className="testi-menu-tag">🍜 {item.menuName}</div>
                    )}
                    <div className="testi-stars">
                      {"★".repeat(item.rating || 5)}
                    </div>
                  </div>
                </div>

                <p className="testi-comment">"{item.comment}"</p>
              </div>

              <div className="testi-date">
                {item.date || "Pelanggan Terverifikasi"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* TOMBOL COMPACT MENUJU HALAMAN SEMUA ULASAN (all-reviews) */}
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <button
            type="button"
            onClick={() => onOpenAllReviews && onOpenAllReviews()}
            className="testi-more-btn btn-sweep-red-to-white"
          >
            <span>Lihat Ulasan Lainnya ({reviewsList.length})</span>
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
