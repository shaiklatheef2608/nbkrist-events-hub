import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { EventCard } from '../../components/events/EventCard';
import { EventFilters } from '../../components/events/EventFilters';
import { EmptyState } from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/LoadingState';
import { subscribeToPublishedEvents } from '../../lib/firestore';
import { NBKRISTEvent, FilterState } from '../../types';
import { INITIAL_EVENTS } from '../../utils/initialEvents';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [firestoreEvents, setFirestoreEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    department: searchParams.get('dept') || 'all',
    organization: searchParams.get('org') || 'all',
    eventType: searchParams.get('type') || 'all',
    pricing: 'all',
    status: 'all',
    dateFilter: 'all'
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.searchQuery) {
      setFilters(prev => ({ ...prev, searchQuery: q }));
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = subscribeToPublishedEvents(
      (data) => {
        setFirestoreEvents(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const allEvents = useMemo(() => {
    const liveIds = new Set(firestoreEvents.map(e => e.eventId));
    const nonDuplicated = INITIAL_EVENTS.filter(e => !liveIds.has(e.eventId));
    return [...firestoreEvents, ...nonDuplicated];
  }, [firestoreEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(query);
        const matchDesc = event.description.toLowerCase().includes(query);
        const matchDept = event.department.toLowerCase().includes(query);
        const matchOrg = event.organization.toLowerCase().includes(query);
        const matchType = event.eventType.toLowerCase().includes(query);
        const matchVenue = (event.venue || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchDept && !matchOrg && !matchType && !matchVenue) {
          return false;
        }
      }

      if (filters.department !== 'all' && event.department !== filters.department) {
        return false;
      }
      if (filters.organization !== 'all' && event.organization !== filters.organization) {
        return false;
      }
      if (filters.eventType !== 'all' && event.eventType !== filters.eventType) {
        return false;
      }
      if (filters.pricing === 'free') {
        const fee = (event.registrationFee || '').toLowerCase();
        if (fee && !fee.includes('free') && !fee.includes('0')) return false;
      } else if (filters.pricing === 'paid') {
        const fee = (event.registrationFee || '').toLowerCase();
        if (!fee || fee.includes('free') || fee === '₹0' || fee === '0') return false;
      }
      if (filters.status !== 'all' && event.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [allEvents, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(filters.searchQuery ? { q: filters.searchQuery } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header */}
      <div className="bg-[#071638] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-950">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            SEARCH & QUERY ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Search NBKRIST Events Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search by event name, department, chapter, topic, or venue across all active records.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Enter search keywords..."
                className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 rounded-md text-xs sm:text-sm focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter Parameters */}
      <EventFilters
        filters={filters}
        onChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
        onReset={() => {
          setFilters({
            searchQuery: '',
            department: 'all',
            organization: 'all',
            eventType: 'all',
            pricing: 'all',
            status: 'all',
            dateFilter: 'all'
          });
          setSearchParams({});
        }}
      />

      {/* Manifest Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-200">
          <span>SEARCH RESULTS</span>
          <span>{filteredEvents.length} MATCHING RECORDS</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : allEvents.length === 0 ? (
          <EmptyState
            title="No upcoming events yet."
            description="The events collection is currently empty."
            icon="calendar"
            variant="page"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match your filters."
            description="No events match your search query or filters. Try adjusting your search term."
            icon="search"
            actionText="Clear Search"
            onAction={() => {
              setFilters(prev => ({ ...prev, searchQuery: '' }));
              setSearchParams({});
            }}
            variant="page"
          />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
