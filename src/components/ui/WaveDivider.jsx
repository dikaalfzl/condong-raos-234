export default function WaveDivider({
  topColor = '#FEF5F5',
  bottomColor = '#C0392B',
  variant = 1,
}) {
  const paths = {
    1: 'M0,32 C320,140 620,140 960,64 C1200,10 1350,40 1440,96 L1440,140 L0,140 Z',
    2: 'M0,96 C360,0 720,150 1080,48 C1260,0 1380,40 1440,72 L1440,140 L0,140 Z',
    3: 'M0,64 C240,128 480,0 720,64 C960,128 1200,20 1440,80 L1440,140 L0,140 Z',
  };

  return (
    <div
      className="section-wave-divider"
      style={{
        backgroundColor: topColor,
        lineHeight: 0,
        overflow: 'hidden',
        width: '100%',
        marginTop: '-1px',
        marginBottom: '-1px',
      }}
    >
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        style={{
          display: 'block',
          width: '100%',
          height: 'clamp(55px, 8vw, 115px)',
        }}
      >
        <path d={paths[variant] || paths[1]} fill={bottomColor} />
      </svg>
    </div>
  );
}