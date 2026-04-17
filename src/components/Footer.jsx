export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: '#2D0000',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      
      {/* === LOGO & TEKS DI FOOTER === */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', /* Memastikan posisi logo tepat di tengah */
        gap: '12px',
        marginBottom: '24px'
      }}>
        
        {/* GAMBAR LOGO */}
        <img 
          src="/public/logo_putih.png" /* Pastikan nama file ini sesuai */
          alt="Logo Bakso Condong Raos" 
          style={{ 
            height: '40px', 
            width: 'auto',
            display: 'block'
          }} 
        />

        {/* TEKS SAMPING LOGO */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={{ 
            fontSize: '1.2rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            lineHeight: 1.2,
            letterSpacing: '-0.2px'
          }}>
            Bakso & Mie Ayam
          </span>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'rgba(255, 255, 255, 0.7)', 
            letterSpacing: '0.5px' 
          }}>
            Condong Raos 234
          </span>
        </div>
        
      </div>
      {/* ========================== */}

      <p style={{
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.6,
        maxWidth: 400,
        margin: '0 auto 16px',
      }}>
        Menyajikan bakso sapi segar berkualitas tinggi dengan resep turun-temurun
        sejak 1994.
      </p>

      {/* Bagian Sponsor Sosro */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '32px auto',
        padding: '16px',
        maxWidth: '200px',
      }}>
        <span style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px'
        }}>
          Partner Resmi
        </span>
        
        {/* Gambar dibungkus tag <a> agar bisa diklik */}
        <a 
          href="https://sinarsosro.id/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'; // Efek membesar saat disentuh
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '0.9';
          }}
        >
          <img 
            src="/Sosro.svg" 
            alt="Sosro" 
            style={{ 
              height: '80px', 
              width: 'auto', 
              display: 'block'
            }} 
          />
        </a>
      </div>

      <div style={{
        width: 48,
        height: 2,
        background: 'linear-gradient(90deg, #8B0000, #C0392B)',
        borderRadius: 9999,
        margin: '0 auto 16px',
      }} />

      <p style={{
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.3)',
      }}>
        &copy; {year} Bakso & Mie Ayam Condong Raos 234. All rights reserved.
      </p>
    </footer>
  );
}