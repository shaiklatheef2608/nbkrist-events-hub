import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EventFilters } from '../../components/events/EventFilters';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/LoadingState';
import { subscribeToPublishedEvents } from '../../lib/firestore';
import { NBKRISTEvent, FilterState } from '../../types';
import { Calendar, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize filters from query params if any
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    department: searchParams.get('dept') || 'all',
    organization: searchParams.get('org') || 'all',
    eventType: searchParams.get('type') || 'all',
    pricing: searchParams.get('pricing') || 'all',
    status: searchParams.get('status') || 'all',
    dateFilter: searchParams.get('filter') === 'upcoming' ? 'upcoming' : 'all'
  });

  useEffect(() => {
    const unsubscribe = subscribeToPublishedEvents(
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore events query notice:", err?.message || err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return events.filter(event => {
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

      if (filters.dateFilter === 'upcoming') {
        if (event.date && event.date < todayStr) return false;
      }

      return true;
    });
  }, [events, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      department: 'all',
      organization: 'all',
      eventType: 'all',
      pricing: 'all',
      status: 'all',
      dateFilter: 'all'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Breadcrumb */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
            <span>NBKRIST INSTITUTIONAL REGISTRY</span>
            <span>/</span>
            <span>EVENTS DISCOVERY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse All Collegiate Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore active technical symposia, IEEE summits, departmental workshops, and student competitions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800">
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>{filteredEvents.length} Published Events Live</span>
        </div>
      </div>

      {/* Filter Controls */}
      <EventFilters
        filters={filters}
        onChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
        onReset={handleResetFilters}
      />

      {/* Results Manifest */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No upcoming events yet."
            description="There are currently no events registered in the NBKRIST Events Hub. Authorized department organizers can publish events via the host portal."
            icon="calendar"
            actionText="Go to Host Portal"
            onAction={() => window.location.href = '/host/login'}
            variant="page"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match your filters."
            description="No events match your search query or selected criteria. Reset filters to view all scheduled events."
            icon="search"
            actionText="Reset Filters"
            onAction={handleResetFilters}
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
