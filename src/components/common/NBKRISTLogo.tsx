import React from 'react';
import officialLogo from '../../assets/images/nbkrist_crest_logo_1791110233742.jpg';

interface NBKRISTLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
}

export const NBKRISTLogo: React.FC<NBKRISTLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'dark',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const titleColor = textColor === 'light' ? 'text-white' : 'text-slate-900';
  const subtitleColor = textColor === 'light' ? 'text-slate-300' : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeMap[size]} shrink-0 flex items-center justify-center p-0.5 rounded-full bg-white shadow-xs border border-slate-200/80 overflow-hidden`}>
        <img 
          src={officialLogo} 
          alt="N.B.K.R. Institute of Science and Technology Official Seal" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to static public logo
            e.currentTarget.src = "/logo/nbkrist-logo.png";
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight leading-none ${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'} ${titleColor}`}>
            NBKRIST Events Hub
          </span>
          <span className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${subtitleColor}`}>
            Autonomous Institution • Established 1979
          </span>
        </div>
      )}
    </div>
  );
};
export default NBKRISTLogo;
