import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import CSS bawaan Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import data slides
import { slides } from '../data/menuData';

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="banner-wrapper">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          /* ==== KUNCI EFEK SLOW-MO ADA DI SINI ==== */
          speed={2500} /* Kecepatan transisi 1.8 detik (1800ms) */
          /* ======================================== */
          className="hero-swiper"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="hero-slide">
                {/* Bagian Kiri: Gambar dengan potongan lengkung */}
                <div className="hero-img-container">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hero-img"
                  />
                  <div className="hero-img-overlay" />
                </div>

                {/* Bagian Kanan: Teks dengan background merah bawaan kotak banner */}
                <div className="hero-text-container">
                  <div className="hero-text-content">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="hero-title"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="hero-badge-container"
                    >
                      <span className="hero-badge">🔥 Populer</span>
                      <span className="hero-badge-text">{slide.highlight || "Menu Andalan"}</span>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="hero-subtitle"
                    >
                      "{slide.subtitle}"
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <a
                        href="#menu"
                        onClick={(e) => {
                          e.preventDefault();
                          document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hero-cta-btn"
                      >
                        Lihat Menu Kami
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Style CSS - Aman pakai backtick! */}
      <style>{`
        /* Section luar berwarna cerah agar banner menonjol */
        .hero-section {
          padding: 110px 24px 40px; 
          background: #FEF5F5; 
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        /* Ini kotak merah utama banner Anda */
        .banner-wrapper {
          width: 100%;
          max-width: 1100px;
          height: 480px;
          background: linear-gradient(135deg, #D35400 0%, #990000 45%, #3E0000 100%);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(139, 0, 0, 0.25);
          position: relative;
        }

        .hero-swiper {
          height: 100%;
          width: 100%;
        }

        /* === TAMBAHAN AGAR EFEK SLOW-MO LEBIH ELEGAN === */
        /* Mengubah kurva animasi dari kaku menjadi ada rem halusnya (ease-in-out) */
        .hero-swiper .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1) !important;
        }

        .hero-slide {
          display: flex;
          height: 100%;
          width: 100%;
        }

        /* Setengah kiri untuk gambar */
        .hero-img-container {
          width: 50%;
          height: 100%;
          clip-path: ellipse(90% 100% at 0% 50%); 
          position: relative;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.1);
        }

        /* Setengah kanan untuk teks */
        .hero-text-container {
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .hero-text-content {
          max-width: 450px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          color: white;
          line-height: 1.1;
          margin-bottom: 20px;
          font-family: 'Arial Black', sans-serif;
        }

        .hero-badge-container {
          display: inline-flex;
          align-items: center;
          background: white;
          border-radius: 99px;
          padding: 5px 16px 5px 5px;
          margin-bottom: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .hero-badge {
          background: #8B0000;
          color: white;
          padding: 6px 12px;
          border-radius: 99px;
          font-weight: bold;
          font-size: 0.75rem;
        }

        .hero-badge-text {
          color: #8B0000;
          font-weight: bold;
          font-size: 0.8rem;
          margin-left: 10px;
        }

        .hero-subtitle {
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 30px;
          font-style: italic;
        }

        /* === TOMBOL LIHAT MENU (BANNER) === */
        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          background: #F39C12; 
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .hero-cta-btn::before {
          content: '';
          position: absolute;
          top: 100%;
          left: -25%;
          width: 150%;
          height: 200%;
          background-color: #171717; 
          border-radius: 50% 50% 0 0;
          transition: top 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
        }

        .hero-cta-btn:hover::before {
          top: -25%; 
        }

        .hero-cta-btn:hover {
          color: white !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(139, 0, 0, 0.4);
        }

        /* ==== KUSTOMISASI TOMBOL PANAH SWIPER ==== */
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          background-color: white !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          color: #8B0000 !important; 
          transition: all 0.3s ease;
        }

        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 1.2rem !important;
          font-weight: 900 !important;
        }

        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          transform: scale(1.15);
          background-color: #F39C12 !important; 
          color: white !important; 
        }

        .hero-swiper .swiper-button-prev { left: 16px !important; }
        .hero-swiper .swiper-button-next { right: 16px !important; }
        
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #F39C12 !important;
          width: 24px !important;
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
        }

        /* Responsif untuk layar HP */
        @media (max-width: 768px) {
          .hero-section {
            padding-top: 90px;
          }
          .banner-wrapper {
            height: 600px; 
            border-radius: 24px;
          }
          .hero-slide {
            flex-direction: column; 
          }
          .hero-img-container {
            width: 100%;
            height: 45%; 
            clip-path: ellipse(150% 90% at 50% 0%); 
          }
          .hero-text-container {
            width: 100%;
            height: 55%; 
            padding: 20px;
          }
          .hero-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}