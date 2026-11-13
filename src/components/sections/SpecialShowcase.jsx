import { useState, useEffect, useCallback } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import '../../styles/SpecialShowcase.css';

export default function SpecialShowcase({ refreshTrigger }) {
  const [ratingStats, setRatingStats] = useState({ avg: "4.9", count: 0 });

  const fetchRealRating = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase.from("reviews").select("rating");
      if (!error && data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        const avg = (sum / data.length).toFixed(1);
        setRatingStats({ avg, count: data.length });
      }
    } catch (err) {
      console.error("Gagal mengambil rating showcase:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchRealRating();
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("public:showcase_rating_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => {
          fetchRealRating();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRealRating, refreshTrigger]);

  const scrollToMenu = (e) => {
    e.preventDefault();
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="special-showcase-section">
      <div className="special-showcase-container">
        <div className="special-board-card">
          {/* === 1. BARIS HEADER ATAS === */}
          <div className="special-header-row">
            <h2 className="special-main-heading">
              KENAPA BAKSO KAMI <br />
              BEGITU SPESIAL{" "}
              <svg
                className="wavy-squiggly"
                viewBox="0 0 80 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C8 2 14 2 20 10C26 18 32 18 38 10C44 2 50 2 56 10C62 18 68 18 74 10"
                  stroke="#9a1006"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <br />
              BAGI PELANGGAN?
            </h2>
          </div>

          {/* === 2. GRID 3 KOLOM KOLASE FOTO (ANIMASI FLOATING MULUS TANPA PATAH SAAT HOVER) === */}
          <div className="special-collage-grid">
            {/* KOLOM 1 (KIRI) */}
            <div
              className="collage-col-left float-anim-1"
              onClick={scrollToMenu}
            >
              <div className="white-tall-card smooth-hover-card">
                <div className="stamp-badge">
                  <span>100% DAGING</span>
                  <strong>SAPI ASLI</strong>
                </div>
                <img
                  src="/bakso.webp"
                  alt="Bakso Asli Solo"
                  className="tall-card-img"
                  onError={(e) => {
                    e.currentTarget.src = "/menu_bakso.webp";
                  }}
                />
              </div>
            </div>

            {/* KOLOM 2 (TENGAH) */}
            <div className="collage-col-center">
              <div
                className="float-anim-2"
                style={{ width: "100%", display: "flex" }}
              >
                <div
                  className="black-mini-card smooth-hover-card"
                  onClick={scrollToMenu}
                >
                  <span className="yellow-arrow-badge">
                    <FiArrowUpRight />
                  </span>
                  <img
                    src="/menu_mie.webp"
                    alt="Mie Ayam Spesial"
                    className="mini-card-img-top"
                  />
                </div>
              </div>

              <div
                className="float-anim-3"
                style={{ flex: 1, display: "flex" }}
              >
                <div
                  className="maroon-feature-card smooth-hover-card"
                  onClick={scrollToMenu}
                >
                  <div className="maroon-card-text">
                    <h3>
                      NIKMATI KELEZATAN
                      <br />
                      BAKSO DAN MIE AYAM
                      <br />
                      ASLI SOLO.
                    </h3>
                  </div>
                  <img
                    src="/menu_bakso.webp"
                    alt="Bakso Spesial"
                    className="maroon-card-img"
                  />
                </div>
              </div>
            </div>

            {/* KOLOM 3 (KANAN) */}
            <div className="collage-col-right">
              <div className="float-anim-4">
                <div
                  className="yellow-hero-card smooth-hover-card"
                  onClick={scrollToMenu}
                >
                  <span className="combo-maroon-pill">KOMPLIT</span>
                  <img
                    src="/mieayambakso.webp"
                    alt="Mie Ayam Bakso Komplit"
                    className="yellow-card-img"
                    onError={(e) => {
                      e.currentTarget.src = "/menu_komplit.webp";
                    }}
                  />
                </div>
              </div>

              <div className="quote-mini-box">
                <span className="quote-mark">“</span>
                <p>
                  Diracik sepenuh hati sejak 1994 dengan bahan segar setiap hari
                  untuk menjaga cita rasa khas Condong Raos 234.
                </p>
              </div>
            </div>
          </div>

          {/* === 3. BANNER HITAM & KUNING BAWAH (RATING REAL DARI SUPABASE) === */}
          <div className="special-bottom-black-bar smooth-hover-card">
            <div className="black-bar-left">
              <h3>
                MENGUTAMAKAN RASA DAN KUALITAS
                <br />
                DI SETIAP SAJIAN!
              </h3>
            </div>

            <div className="black-bar-divider" />

            <div className="black-bar-center">
              <div className="rating-big-num">
                {ratingStats.avg} <span className="star-yellow">★</span>
              </div>
              <div className="rating-sub-text">
                {ratingStats.count > 0
                  ? `Berdasarkan ${ratingStats.count} ulasan asli pelanggan kami`
                  : "Rating kepuasan pelanggan setia kami"}
              </div>
            </div>

            <img
              src="/menu_komplit.webp"
              alt="Bakso Bulat"
              className="black-bar-corner-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
