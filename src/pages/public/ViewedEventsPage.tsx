import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Trash2, ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import { getRecentlyViewedEvents, clearRecentlyViewedEvents, ViewedEventItem } from '../../utils/recentlyViewed';
import { CollegiateEventCard } from '../../components/events/CollegiateEventCard';
import { EmptyState } from '../../components/common/EmptyState';

export const ViewedEventsPage: React.FC = () => {
  const [viewedList, setViewedList] = useState<ViewedEventItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setViewedList(getRecentlyViewedEvents());
  }, []);

  const handleClear = () => {
    clearRecentlyViewedEvents();
    setViewedList([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[75vh]">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
            <span>NBKRIST EVENTS HUB</span>
            <span>/</span>
            <span>ACTIVITY HISTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Viewed Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Events you have recently clicked and viewed on the Home page or All Events discovery hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800">
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>{viewedList.length} Events Viewed</span>
          </span>

          {viewedList.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-medium text-red-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Viewed Events */}
      {viewedList.length === 0 ? (
        <EmptyState
          title="No viewed events yet."
          description="When you click on any event from the Home page or All Events page, it will automatically appear here for easy reference."
          icon="calendar"
          actionText="Explore All Events"
          onAction={() => navigate('/events')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewedList.map(({ event, viewedAt }) => (
            <div key={event.eventId} className="space-y-2">
              <CollegiateEventCard event={event} size="standard" />
              <div className="text-[11px] font-mono text-slate-400 text-right pr-1">
                Viewed on: {new Date(viewedAt).toLocaleDateString()} at {new Date(viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
