import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  AlertCircle, 
  Share2, 
  Check, 
  Layers,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { getEventById } from '../../lib/firestore';
import { NBKRISTEvent } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RegisterButton } from '../../components/common/RegisterButton';
import { PageLoadingState } from '../../components/common/LoadingState';
import { HOST_METADATA } from '../../utils/constants';
import { INITIAL_EVENTS } from '../../utils/initialEvents';

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<NBKRISTEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError('No event identifier provided.');
        setLoading(false);
        return;
      }

      try {
        const data = await getEventById(eventId);
        if (data) {
          setEvent(data);
        } else {
          // Check initial curated events as fallback
          const fallback = INITIAL_EVENTS.find(e => e.eventId === eventId);
          if (fallback) {
            setEvent(fallback);
          } else {
            setError('Event not found. This event may have been removed or the link is invalid.');
          }
        }
      } catch (err: any) {
        console.error("Notice loading event:", err);
        const fallback = INITIAL_EVENTS.find(e => e.eventId === eventId);
        if (fallback) {
          setEvent(fallback);
        } else {
          setError('Unable to load event details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return <PageLoadingState message="Fetching official event manifest..." />;
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {error || "The requested event record does not exist in the NBKRIST Events Hub."}
        </p>
        <div className="pt-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 bg-[#091e42] text-white text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-[#071733] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Events Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const hostMeta = HOST_METADATA[event.organization];
  const eventCode = `${hostMeta?.code || 'NBKR'}-${event.date ? event.date.slice(0, 4) : '2025'}-${event.eventId.slice(0, 5).toUpperCase()}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Share Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        <button
          onClick={handleShare}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied' : 'Share Event'}</span>
        </button>
      </div>

      {/* Main Event Showcase Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Verification Strip */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">MANIFEST:</span>
            <span className="font-bold text-slate-800">{event.organization}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              VERIFIED HOST
            </span>
            <span className="hidden sm:inline font-mono text-slate-400 text-[11px]">
              CODE: {eventCode}
            </span>
          </div>

          <StatusBadge status={event.status} size="md" />
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Poster / Visual Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full aspect-16/9 sm:aspect-video rounded-lg overflow-hidden bg-[#091a38] text-white relative flex flex-col justify-between border border-slate-800 shadow-md">
              {event.posterUrl && !imgError ? (
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 h-full flex flex-col justify-between select-none">
                  {/* Tech circuit grid background design */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`detail-grid-${event.eventId}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#detail-grid-${event.eventId})`} />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-start justify-between">
                    <span className="text-xs font-mono tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-xs uppercase font-semibold">
                      {event.eventType}
                    </span>
                    <Layers className="w-5 h-5 text-sky-400 opacity-60" />
                  </div>

                  <div className="relative z-10 my-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-xs text-sky-200 mt-2 font-mono">
                      {event.department}
                    </p>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">{event.organization}</span>
                    <span>{event.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Card under poster */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono uppercase text-[10px]">Registration Status</span>
                <StatusBadge status={event.status} size="sm" />
              </div>

              <div className="pt-2">
                <RegisterButton event={event} size="lg" className="w-full" />
              </div>

              {event.registrationDeadline && (
                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deadline: <strong>{event.registrationDeadline}</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Title, Metadata, Schedule, Description */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-2">
                <span>{event.department}</span>
                <span className="text-slate-300">•</span>
                <span>{event.eventType}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {event.title}
              </h1>
            </div>

            {/* Event Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Date of Event</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {event.date}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Timings</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Venue / Campus Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {event.venue || 'NBKRIST Campus, Vidyanagar'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-start gap-3">
                <Tag className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Registration Fee</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700">
                    {event.registrationFee || 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                Full Event Description
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                {event.description}
              </div>
            </div>

            {/* Coordinators Information Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-700" />
                <span>Coordinator Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Lead Coordinator</span>
                  <span className="font-semibold text-slate-800">
                    {event.coordinatorName || 'Departmental Coordinator'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Contact Email</span>
                  {event.coordinatorEmail ? (
                    <a href={`mailto:${event.coordinatorEmail}`} className="text-blue-700 hover:underline font-mono">
                      {event.coordinatorEmail}
                    </a>
                  ) : (
                    <span className="text-slate-500 font-mono">events@nbkrist.org</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Contact Phone</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {event.coordinatorPhone || 'Available upon registration'}
                  </span>
                </div>
              </div>
            </div>

            {/* Institutional Linkage Badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Authorized event published by <strong>{event.organization}</strong> under N.B.K.R. Institute of Science & Technology governance.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
