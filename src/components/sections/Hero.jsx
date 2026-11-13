import { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiVolume2 } from "react-icons/fi";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { slides as staticSlides } from "../../data/menuData";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import '../../styles/Hero.css';

export default function Hero({ refreshTrigger }) {
  const { storeStatus } = useAuth();
  const [heroSlides, setHeroSlides] = useState(staticSlides);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchHeroSlides = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          highlight: s.highlight || "Menu Andalan",
          badge: s.badge || "Populer",
          image: s.image_url,
        }));
        setHeroSlides(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat slide hero:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchHeroSlides();
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("public:hero_slides_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_slides" },
        () => {
          fetchHeroSlides();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHeroSlides, refreshTrigger]);

  return (
    <section id="home" className="hero-section">
      {/* === STATUS OPERASIONAL & BANNER PROMO DENGAN TATA LETAK RAPI === */}
      <div className="hero-top-alerts">
        {/* 1. KAPSUL STATUS OPERASIONAL */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`hero-status-pill ${storeStatus.is_open ? "is-open" : "is-closed"}`}
        >
          <div className="status-badge-left">
            <span className="pulse-dot" />
            <span>
              {storeStatus.is_open ? "BUKA HARI INI" : "SEDANG TUTUP"}
            </span>
          </div>

          <div className="status-text-right">
            <FiClock className="status-clock-icon" />
            <span>
              {storeStatus.is_open
                ? "Siap melayani pesanan Anda • Silakan mampir!"
                : "Sampai jumpa kembali di jam operasional berikutnya"}
            </span>
          </div>
        </motion.div>

        {/* 2. KARTU PITA INFO & PROMO (SIMETRIS, RAPI, TANPA TEKS CONDONG RAOS 234) */}
        <AnimatePresence>
          {storeStatus.announcement_active && storeStatus.announcement_text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.4 }}
              className="hero-promo-card"
            >
              <div className="promo-shimmer-effect" />

              <div className="promo-top-bar">
                <div className="promo-icon-badge">
                  <FiVolume2 size={15} />
                </div>
                <span className="promo-mini-tag">✨ INFO & PROMO SPESIAL</span>
              </div>

              <p className="promo-body-text">{storeStatus.announcement_text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* KARTU UTAMA SWIPER HERO */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="banner-wrapper"
      >
        <span className="sparkle-icon sparkle-top-right">✦</span>
        <span className="sparkle-icon sparkle-bottom-right">✦</span>

        <Swiper
          key={heroSlides.length}
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 4200, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop={heroSlides.length > 1}
          speed={850}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="hero-swiper"
        >
          {heroSlides.map((slide, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <SwiperSlide key={slide.id || idx}>
                <div className="hero-slide">
                  <div className="hero-img-frame">
                    <motion.img
                      key={`img-${slide.id}-${isCurrent}`}
                      initial={{ scale: 1.1, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                      src={slide.image}
                      alt={slide.title}
                      className="hero-img"
                    />
                  </div>

                  <div className="hero-text-container">
                    <div className="hero-text-content">
                      <motion.div
                        key={`badge-${slide.id}-${isCurrent}`}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="hero-badge-container"
                      >
                        <span className="hero-badge">
                          🔥 {slide.badge || "Populer"}
                        </span>
                        <span className="hero-badge-text">
                          {slide.highlight || "Menu Andalan"}
                        </span>
                      </motion.div>

                      <motion.h1
                        key={`title-${slide.id}-${isCurrent}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.16 }}
                        className="hero-title"
                      >
                        {slide.title}
                      </motion.h1>

                      <motion.p
                        key={`sub-${slide.id}-${isCurrent}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.24 }}
                        className="hero-subtitle"
                      >
                        {slide.subtitle}
                      </motion.p>

                      <motion.div
                        key={`cta-${slide.id}-${isCurrent}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.32 }}
                      >
                        <a
                          href="#menu"
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .querySelector("#menu")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="hero-cta-btn"
                        >
                          LIHAT MENU KAMI
                        </a>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>
    </section>
  );
}
