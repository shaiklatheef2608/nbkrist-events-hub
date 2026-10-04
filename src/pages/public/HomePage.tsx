import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Scroll & Drag Refs for Featured Events carousel
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Filter live published events
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

  // Carousel Scroll Helpers
  const scrollFeatured = (dir: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const amount = 340;
      featuredScrollRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf0f8] pb-16">
      
      {/* 1. Hero Division with Welcome to NBKRIST & Search Bar */}
      <Hero 
        onSearch={handleHeroSearch} 
        onQuickFilter={handleQuickFilter}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">

        {/* 2. FEATURED EVENTS SECTION */}
        <section className="space-y-6">
          <div className="text-center">
            {/* Unified Text Style across the whole portal */}
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight">
              Featured Events
            </h2>
            <div className="w-16 h-1 bg-[#091e42] mx-auto mt-2 rounded-full"></div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Spotlight technical symposia, workshops, and flagship collegiate events
            </p>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden py-4">
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
              <div className="w-72 shrink-0"><EventCardSkeleton /></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white/80 border border-slate-200/80 rounded-lg p-8 max-w-xl mx-auto text-center shadow-xs">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-sans font-bold text-slate-900 text-base">
                No featured events available yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Published events from approved department organizers will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Horizontal Scroll Carousel */}
              <div 
                ref={featuredScrollRef}
                onMouseDown={(e) => {
                  if (!featuredScrollRef.current) return;
                  setIsDragging(true);
                  setStartX(e.pageX - featuredScrollRef.current.offsetLeft);
                  setScrollLeft(featuredScrollRef.current.scrollLeft);
                }}
                onMouseLeave={() => setIsDragging(false)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={(e) => {
                  if (!isDragging || !featuredScrollRef.current) return;
                  e.preventDefault();
                  const x = e.pageX - featuredScrollRef.current.offsetLeft;
                  const walk = (x - startX) * 1.5;
                  featuredScrollRef.current.scrollLeft = scrollLeft - walk;
                }}
                className={`custom-horizontal-scrollbar flex items-stretch gap-6 overflow-x-auto pb-5 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-hidden select-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {filteredEvents.map((event) => (
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
                    onClick={() => scrollFeatured('left')}
                    aria-label="Previous"
                    className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollFeatured('right')}
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

        {/* 3. Bottom Divider */}
        <div className="border-t border-slate-300/80 pt-4"></div>

      </div>

    </div>
  );
};
