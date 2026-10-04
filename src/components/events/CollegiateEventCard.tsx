import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Tag } from 'lucide-react';
import { NBKRISTEvent } from '../../types';

interface CollegiateEventCardProps {
  event: NBKRISTEvent;
  size?: 'large' | 'standard';
  className?: string;
}

export const CollegiateEventCard: React.FC<CollegiateEventCardProps> = ({ 
  event, 
  size = 'standard',
  className = '' 
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const defaultPoster = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
  const posterSrc = (event.posterUrl && !imgError) ? event.posterUrl : defaultPoster;

  // Format date like screenshot: "25 Oct '26"
  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0].slice(2);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
        const day = parseInt(parts[2], 10);
        return `${day} ${month} '${year}`;
      }
      const d = new Date(dateStr);
      return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
    } catch {
      return dateStr;
    }
  };

  const startDateFormatted = formatDateLabel(event.date);
  const endDateFormatted = formatDateLabel(event.endDate || event.date);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('a')) {
      navigate(`/events/${event.eventId}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer select-none rounded-xs ${className}`}
    >
      {/* Poster Image Container */}
      <div className={`relative w-full ${size === 'large' ? 'aspect-[16/9]' : 'aspect-[16/10]'} bg-slate-900 overflow-hidden`}>
        <img 
          src={posterSrc} 
          alt={event.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Date Badge Banner at Bottom of Image (Exact Match to Screenshot) */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center pb-2 z-10 pointer-events-none">
          <div className="bg-[#0b5c9e] text-white px-4 py-1 text-xs font-semibold font-mono tracking-wide flex items-center gap-2.5 shadow-md rounded-xs">
            <span>{startDateFormatted}</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-200" />
            <span>{endDateFormatted}</span>
          </div>
        </div>

        {/* Category tag overlay on top left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 text-sky-300 backdrop-blur-xs rounded-xs border border-sky-500/30">
            {event.eventType}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-center bg-white">
        <div>
          {/* Host in small lettering */}
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 block truncate mb-1.5">
            {event.organization}
          </span>

          {/* Event Title (Standard Site Typography) */}
          <h3 className={`font-sans font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-[#0b5c9e] transition-colors ${
            size === 'large' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
          }`}>
            {event.title}
          </h3>
        </div>

        {/* Bottom Details & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
          <span className="flex items-center gap-1 truncate text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue || 'NBKRIST Campus'}</span>
          </span>

          <span className="font-semibold text-emerald-700 shrink-0 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-100">
            {event.registrationFee || 'Free'}
          </span>
        </div>
      </div>
    </div>
  );
};
