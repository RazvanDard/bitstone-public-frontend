import React from 'react';

function SectionDivider({ nextSectionColor = 'white', height = 100, useGradient = false }) {
  // Convert height to string with px
  const heightPx = `${height}px`;
  
  return (
    <div className="relative w-full overflow-hidden" style={{ height: heightPx }}>
      {useGradient ? (
        <svg 
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--secondary)' }} />
            </linearGradient>
          </defs>
          <path 
            fill="url(#gradient)"
            d="M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,128C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>
      ) : (
        <svg 
          className={`absolute bottom-0 w-full h-full fill-current ${nextSectionColor}`}
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,64L80,85.3C160,107,320,149,480,154.7C640,160,800,128,960,128C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>
      )}
    </div>
  );
}

export default SectionDivider; 