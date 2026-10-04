import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight, 
  Tag, 
  Clock, 
  Eye
} from 'lucide-react';
import { NBKRISTEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RegisterButton } from '../common/RegisterButton';

interface EventProductCardProps {
  event: NBKRISTEvent;
  className?: string;
}

export const EventProductCard: React.FC<EventProductCardProps> = ({ event, className = '' }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  // Fallback poster based on event department/type
  const defaultPoster = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
  const posterSrc = (event.posterUrl && !imgError) ? event.posterUrl : defaultPoster;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('a')) {
      navigate(`/events/${event.eventId}`);
    }
  };

  const formattedDate = event.date 
    ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer select-none ${className}`}
    >
      {/* 1. Product Photo / Poster Container at Top */}
      <div className="relative w-full aspect-16/10 bg-slate-900 overflow-hidden">
        <img 
          src={posterSrc} 
          alt={event.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for photo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges (Category & Status) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#091e42]/90 text-sky-300 backdrop-blur-xs rounded-xs border border-sky-500/30">
            {event.eventType || 'Event'}
          </span>
          <StatusBadge status={event.status} size="sm" />
        </div>

        {/* Bottom Photo Overlay (Price chip) */}
        <div className="absolute bottom-2 left-2.5 z-10">
          <span className="px-2 py-0.5 text-[11px] font-bold bg-white/95 text-slate-900 rounded-sm shadow-xs border border-slate-200">
            {event.registrationFee || 'Free'}
          </span>
        </div>
      </div>

      {/* 2. Product Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Host in small letters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 truncate">
              {event.organization}
            </span>
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          </div>

          {/* Event Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1 group-hover:text-blue-700 transition-colors">
            {event.title}
          </h3>

          {/* Date and Venue */}
          <div className="space-y-1 mt-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{formattedDate} {event.startTime ? `• ${event.startTime}` : ''}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Action Buttons (E-Commerce style: More Details & Register Now) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <Link
            to={`/events/${event.eventId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-md border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>More details</span>
          </Link>

          <RegisterButton 
            event={event} 
            size="sm" 
            className="w-full justify-center text-xs py-2 shadow-xs" 
          />
        </div>
      </div>
    </div>
  );
};
