import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  ShieldCheck, 
  FileText, 
  User, 
  Phone, 
  Layers
} from 'lucide-react';
import { NBKRISTEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RegisterButton } from '../common/RegisterButton';
import { HOST_METADATA } from '../../utils/constants';

interface EventCardProps {
  event: NBKRISTEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const hostMeta = HOST_METADATA[event.organization];
  const eventCode = `${hostMeta?.code || 'NBKR'}-${event.date ? event.date.slice(0, 4) : '2025'}-${event.eventId.slice(0, 5).toUpperCase()}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate to event details if not clicking an interactive action button
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('a')) {
      navigate(`/events/${event.eventId}`);
    }
  };

  const hasValidPoster = Boolean(event.posterUrl && !imgError);

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* 1. Top 16:9 Poster Container */}
      <div 
        onClick={() => navigate(`/events/${event.eventId}`)}
        className="relative w-full aspect-16/9 overflow-hidden bg-[#091a38] text-white cursor-pointer group/poster border-b border-slate-100 flex flex-col justify-between"
      >
        {hasValidPoster ? (
          <img 
            src={event.posterUrl} 
            alt={event.title} 
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Existing NBKRIST event placeholder */
          <div className="absolute inset-0 p-5 flex flex-col justify-between select-none">
            {/* Tech circuit grid background design */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`card-grid-${event.eventId}`} width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#card-grid-${event.eventId})`} />
              </svg>
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <span className="text-[11px] font-mono tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-0.5 rounded-xs uppercase font-semibold">
                {event.eventType}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={event.status} size="sm" />
                <Layers className="w-4 h-4 text-sky-400 opacity-60" />
              </div>
            </div>

            <div className="relative z-10 my-auto text-left">
              <h4 className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight line-clamp-2">
                {event.title}
              </h4>
              <p className="text-xs text-sky-200 mt-1 line-clamp-1 font-mono">
                {event.department}
              </p>
            </div>

            <div className="relative z-10 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-semibold text-slate-300">{event.organization}</span>
              <span>{event.date}</span>
            </div>
          </div>
        )}

        {/* If posterUrl is valid and loaded, overlay status badge in top-right for quick visibility */}
        {hasValidPoster && (
          <div className="absolute top-3 right-3 z-10 drop-shadow-sm">
            <StatusBadge status={event.status} size="sm" />
          </div>
        )}
      </div>

      {/* Top Verification Header */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
            {event.organization.slice(0, 1)}
          </div>
          <span className="font-bold text-slate-800 tracking-tight">{event.organization}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded-xs">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            VERIFIED HOST
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
            CODE: {eventCode}
          </span>
        </div>

        {hasValidPoster ? (
          <span className="text-[11px] font-mono text-blue-700 font-semibold uppercase tracking-wider">
            {event.eventType}
          </span>
        ) : (
          <StatusBadge status={event.status} size="sm" />
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-blue-700 uppercase tracking-wider mb-1">
            <span>{event.department}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-sans normal-case">{event.eventType}</span>
          </div>

          <Link 
            to={`/events/${event.eventId}`}
            className="group-hover:text-blue-700 transition-colors block"
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {event.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
          <div className="bg-slate-50 border border-slate-100 rounded-md p-2 flex items-start gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-mono text-slate-400">Date & Schedule</span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {event.date} {event.startTime ? `• ${event.startTime}` : ''}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-md p-2 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-mono text-slate-400">Venue / Location</span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {event.venue || 'NBKRIST Campus'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-md p-2 flex items-start gap-2">
            <Tag className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-mono text-slate-400">Registration Fee</span>
              <span className="text-xs font-semibold text-emerald-700 truncate block">
                {event.registrationFee || 'Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Coordinators Bar */}
        {(event.coordinatorName || event.coordinatorPhone) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
            {event.coordinatorName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span>Lead: <strong className="text-slate-700">{event.coordinatorName}</strong></span>
              </div>
            )}
            {event.coordinatorPhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{event.coordinatorPhone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Institutional Linkage Verified</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            to={`/events/${event.eventId}`}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Event Details</span>
          </Link>
          <RegisterButton event={event} size="md" />
        </div>
      </div>
    </div>
  );
};
export default EventCard;
