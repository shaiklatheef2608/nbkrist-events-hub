import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hero, HeroSearchParams } from '../../components/home/Hero';
import { CollegiateEventCard } from '../../components/events/CollegiateEventCard';
import { EventCardSkeleton } from '../../components/common/LoadingState';
import { subscribeToPublishedEvents } from '../../lib/firestore';
import { NBKRISTEvent } from '../../types';
import { ChevronLeft, ChevronRight, MoveHorizontal, Calendar } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters from Hero search bar
  const [searchParams, setSearchParams] = useState<HeroSearchParams>({
    query: '',
    eventType: 'all',
    date: ''
  });

  // Scroll & Drag Refs for carousels
  const futureScrollRef = useRef<HTMLDivElement>(null);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingFuture, setIsDraggingFuture] = useState(false);
  const [isDraggingUpcoming, setIsDraggingUpcoming] = useState(false);
  const [startXFuture, setStartXFuture] = useState(0);
  const [startXUpcoming, setStartXUpcoming] = useState(0);
  const [scrollLeftFuture, setScrollLeftFuture] = useState(0);
  const [scrollLeftUpcoming, setScrollLeftUpcoming] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToPublishedEvents(
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (error) => {
        console.warn("Notice: Firestore events query:", error?.message || error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleHeroSearch = (params: HeroSearchParams) => {
    setSearchParams(params);
  };

  const handleQuickFilter = (key: string, val: string) => {
    setSearchParams(prev => ({
      ...prev,
      eventType: key === 'eventType' ? val : prev.eventType
    }));
  };

  // Safe filter logic - filters all published events without errors
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event) return false;

      // 1. Text Query Filter
      if (searchParams.query.trim()) {
        const q = searchParams.query.toLowerCase().trim();
        const titleMatch = (event.title || '').toLowerCase().includes(q);
        const descMatch = (event.description || '').toLowerCase().includes(q);
        const orgMatch = (event.organization || '').toLowerCase().includes(q);
        const deptMatch = (event.department || '').toLowerCase().includes(q);
        const venueMatch = (event.venue || '').toLowerCase().includes(q);

        if (!titleMatch && !descMatch && !orgMatch && !deptMatch && !venueMatch) {
          return false;
        }
      }

      // 2. Event Type Filter
      if (searchParams.eventType && searchParams.eventType !== 'all') {
        if (event.eventType !== searchParams.eventType) {
          return false;
        }
      }

      // 3. Date Filter
      if (searchParams.date) {
        const eventDate = event.date || '';
        if (eventDate && eventDate !== searchParams.date) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchParams]);

  // Segregate events into Current Running Month (Future Events) vs. Next Month Onwards (Upcoming Events)
  const { futureEvents, upcomingEvents } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (e.g. 9 for October)

    const future: NBKRISTEvent[] = [];
    const upcoming: NBKRISTEvent[] = [];

    filteredEvents.forEach((event) => {
      if (!event.date) {
        future.push(event);
        return;
      }

      try {
        const parts = event.date.split('-');
        if (parts.length >= 2) {
          const eYear = parseInt(parts[0], 10);
          const eMonth = parseInt(parts[1], 10) - 1; // 0-indexed

          if (eYear === currentYear && eMonth === currentMonth) {
            // Event is in the current running month (e.g. October)
            future.push(event);
          } else if (eYear > currentYear || (eYear === currentYear && eMonth > currentMonth)) {
            // Event is in subsequent months (e.g. November onwards)
            upcoming.push(event);
          } else {
            // Past event in this year or earlier
            future.push(event);
          }
        } else {
          future.push(event);
        }
      } catch {
        future.push(event);
      }
    });

    return { futureEvents: future, upcomingEvents: upcoming };
  }, [filteredEvents]);

  // Carousel Scroll Helpers
  const scrollFuture = (dir: 'left' | 'right') => {
    if (futureScrollRef.current) {
      const amount = 340;
      futureScrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  const scrollUpcoming = (dir: 'left' | 'right') => {
    if (upcomingScrollRef.current) {
      const amount = 340;
      upcomingScrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf0f8] pb-16">
      
      {/* 1. Hero Division with Welcome to NBKR Events Hub & Search Bar */}
      <Hero 
        onSearch={handleHeroSearch} 
        onQuickFilter={handleQuickFilter}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">

        {/* 2. FUTURE EVENTS SECTION (Current Month Events) */}
        <section className="space-y-6">
          <div className="text-center">
            {/* Unified Text Style across the whole portal */}
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
              Future Events
            </h2>
            <div className="w-16 h-1 bg-[#091e42] mx-auto mt-2 rounded-full"></div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Events scheduled during the current running month
            </p>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden py-4">
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
            </div>
          ) : futureEvents.length === 0 ? (
            <div className="bg-white/80 border border-slate-200/80 rounded-lg p-8 max-w-xl mx-auto text-center shadow-xs">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-sans font-bold text-slate-900 text-base">
                No future events scheduled for this month yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Events hosted for this month will appear here as soon as they are published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Horizontal Scroll Carousel */}
              <div 
                ref={futureScrollRef}
                onMouseDown={(e) => {
                  if (!futureScrollRef.current) return;
                  setIsDraggingFuture(true);
                  setStartXFuture(e.pageX - futureScrollRef.current.offsetLeft);
                  setScrollLeftFuture(futureScrollRef.current.scrollLeft);
                }}
                onMouseLeave={() => setIsDraggingFuture(false)}
                onMouseUp={() => setIsDraggingFuture(false)}
                onMouseMove={(e) => {
                  if (!isDraggingFuture || !futureScrollRef.current) return;
                  e.preventDefault();
                  const x = e.pageX - futureScrollRef.current.offsetLeft;
                  const walk = (x - startXFuture) * 1.5;
                  futureScrollRef.current.scrollLeft = scrollLeftFuture - walk;
                }}
                className={`custom-horizontal-scrollbar flex items-stretch gap-6 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden select-none ${
                  isDraggingFuture ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {futureEvents.map((event) => (
                  <div 
                    key={event.eventId}
                    className="w-[280px] sm:w-[310px] md:w-[325px] shrink-0 snap-start flex pointer-events-auto"
                  >
                    <CollegiateEventCard 
                      event={event} 
                      size="standard"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation & Drag Hint */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                  <MoveHorizontal className="w-3.5 h-3.5 text-[#091e42] animate-pulse" />
                  <span>Swipe or drag horizontally</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollFuture('left')}
                    aria-label="Previous"
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollFuture('right')}
                    aria-label="Next"
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. UPCOMING EVENTS SECTION (Next Months Events) */}
        <section className="space-y-6">
          <div className="text-center">
            {/* Unified Text Style across the whole portal */}
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
              Upcoming Events
            </h2>
            <div className="w-16 h-1 bg-[#091e42] mx-auto mt-2 rounded-full"></div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Events scheduled for upcoming months
            </p>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden py-4">
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-white/80 border border-slate-200/80 rounded-lg p-8 max-w-xl mx-auto text-center shadow-xs">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-sans font-bold text-slate-900 text-base">
                No upcoming events scheduled for next month yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Events hosted for future months will appear here as soon as they are published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Horizontal Scroll Carousel */}
              <div 
                ref={upcomingScrollRef}
                onMouseDown={(e) => {
                  if (!upcomingScrollRef.current) return;
                  setIsDraggingUpcoming(true);
                  setStartXUpcoming(e.pageX - upcomingScrollRef.current.offsetLeft);
                  setScrollLeftUpcoming(upcomingScrollRef.current.scrollLeft);
                }}
                onMouseLeave={() => setIsDraggingUpcoming(false)}
                onMouseUp={() => setIsDraggingUpcoming(false)}
                onMouseMove={(e) => {
                  if (!isDraggingUpcoming || !upcomingScrollRef.current) return;
                  e.preventDefault();
                  const x = e.pageX - upcomingScrollRef.current.offsetLeft;
                  const walk = (x - startXUpcoming) * 1.5;
                  upcomingScrollRef.current.scrollLeft = scrollLeftUpcoming - walk;
                }}
                className={`custom-horizontal-scrollbar flex items-stretch gap-6 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden select-none ${
                  isDraggingUpcoming ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {upcomingEvents.map((event) => (
                  <div 
                    key={event.eventId}
                    className="w-[280px] sm:w-[310px] md:w-[325px] shrink-0 snap-start flex pointer-events-auto"
                  >
                    <CollegiateEventCard 
                      event={event} 
                      size="standard"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation & Drag Hint */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                  <MoveHorizontal className="w-3.5 h-3.5 text-[#091e42] animate-pulse" />
                  <span>Swipe or drag horizontally</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollUpcoming('left')}
                    aria-label="Previous"
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollUpcoming('right')}
                    aria-label="Next"
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. Bottom Divider Under Upcoming Events */}
        <div className="border-t border-slate-300/80 pt-6"></div>

      </div>

    </div>
  );
};
