import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NBKRISTEvent } from '../../types';
import { EventProductCard } from './EventProductCard';
import { EmptyState } from '../common/EmptyState';

interface EventScrollCarouselProps {
  events: NBKRISTEvent[];
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const EventScrollCarousel: React.FC<EventScrollCarouselProps> = ({ 
  events,
  title = "Published Events",
  subtitle = "Swipe or scroll horizontally to discover scheduled collegiate events.",
  emptyTitle = "No upcoming events yet.",
  emptyDescription = "Events published by NBKRIST departments and student chapters will be displayed here once published."
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon="calendar"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Horizontal Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-mono font-semibold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-full">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scroll Left / Right Buttons */}
        {events.length > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleScroll('left')}
              aria-label="Scroll Left"
              className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Scroll Right"
              className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Side-Scrolling Track */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #f1f5f9'
        }}
      >
        {events.map((event) => (
          <div 
            key={event.eventId}
            className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start flex"
          >
            <EventProductCard 
              event={event} 
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
