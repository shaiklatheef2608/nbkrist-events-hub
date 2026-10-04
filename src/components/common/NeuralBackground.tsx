import React from 'react';

interface NeuralBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium';
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ 
  className = '',
  intensity = 'subtle' 
}) => {
  const opacity = intensity === 'subtle' ? 'opacity-25' : 'opacity-40';

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${opacity} ${className}`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="neural-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
          </linearGradient>
          <pattern id="tech-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#38bdf8" fillOpacity="0.18" />
          </pattern>
        </defs>

        {/* Dot pattern grid */}
        <rect width="100%" height="100%" fill="url(#tech-dots)" />

        {/* Neural network lines and nodes */}
        <g stroke="url(#neural-line-grad)" strokeWidth="1" fill="none">
          <path d="M 80,120 L 220,180 L 380,110 L 540,230 L 720,160 L 910,240 L 1100,140 L 1320,220" />
          <path d="M 220,180 L 260,340 L 440,380 L 540,230 L 680,390 L 880,360 L 910,240" />
          <path d="M 380,110 L 440,380 L 620,480 L 720,160" />
          <path d="M 720,160 L 840,90 L 1100,140 L 1260,80 L 1320,220" />
          <path d="M 680,390 L 880,360 L 1020,440 L 1200,380 L 1320,220" />
          <path d="M 120,420 L 260,340 L 440,380" />
          <path d="M 1020,440 L 1260,510 L 1380,380" />
        </g>

        {/* Subtle geometric nodes */}
        <g fill="#38bdf8">
          <circle cx="80" cy="120" r="3" fillOpacity="0.6" />
          <circle cx="220" cy="180" r="4" fillOpacity="0.8" />
          <circle cx="380" cy="110" r="3.5" fillOpacity="0.7" />
          <circle cx="540" cy="230" r="4.5" fillOpacity="0.9" />
          <circle cx="720" cy="160" r="5" fillOpacity="1" />
          <circle cx="910" cy="240" r="4" fillOpacity="0.8" />
          <circle cx="1100" cy="140" r="3.5" fillOpacity="0.7" />
          <circle cx="1320" cy="220" r="4.5" fillOpacity="0.8" />
          <circle cx="260" cy="340" r="3" fillOpacity="0.6" />
          <circle cx="440" cy="380" r="4" fillOpacity="0.7" />
          <circle cx="680" cy="390" r="3.5" fillOpacity="0.6" />
          <circle cx="880" cy="360" r="4" fillOpacity="0.7" />
          <circle cx="1020" cy="440" r="3.5" fillOpacity="0.7" />
          <circle cx="1200" cy="380" r="3" fillOpacity="0.6" />
          <circle cx="840" cy="90" r="2.5" fillOpacity="0.5" />
          <circle cx="1260" cy="80" r="3" fillOpacity="0.5" />
        </g>

        {/* Halo pulses around major nodes */}
        <g stroke="#38bdf8" strokeWidth="1" fill="none">
          <circle cx="540" cy="230" r="10" strokeOpacity="0.3" strokeDasharray="3 3" />
          <circle cx="720" cy="160" r="12" strokeOpacity="0.4" strokeDasharray="4 4" />
          <circle cx="910" cy="240" r="9" strokeOpacity="0.3" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
};
