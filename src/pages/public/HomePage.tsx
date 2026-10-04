import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hero } from '../../components/home/Hero';
import { EventFilters } from '../../components/events/EventFilters';
import { EventCard } from '../../components/events/EventCard';
import { FilterReconciliationSidebar } from '../../components/home/FilterReconciliationSidebar';
import { WhitelistSecuritySection } from '../../components/home/WhitelistSecuritySection';
import { EmptyState } from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/LoadingState';
import { subscribeToPublishedEvents } from '../../lib/firestore';
import { NBKRISTEvent, FilterState } from '../../types';
import { Database, Sparkles, ArrowRight } from 'lucide-react';

const initialFilters: FilterState = {
  searchQuery: '',
  department: 'all',
  organization: 'all',
  eventType: 'all',
  pricing: 'all',
  status: 'all',
  dateFilter: 'all'
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    const unsubscribe = subscribeToPublishedEvents(
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore events query notice:", error?.message || error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSearch = (query: string, department: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query,
      department: department
    }));
  };

  const handleQuickFilter = (key: string, val: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search text filter
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

      // Department filter
      if (filters.department !== 'all' && event.department !== filters.department) {
        return false;
      }

      // Organization filter
      if (filters.organization !== 'all' && event.organization !== filters.organization) {
        return false;
      }

      // Event Type filter
      if (filters.eventType !== 'all' && event.eventType !== filters.eventType) {
        return false;
      }

      // Pricing filter
      if (filters.pricing === 'free') {
        const fee = (event.registrationFee || '').toLowerCase();
        if (fee && !fee.includes('free') && !fee.includes('0')) {
          return false;
        }
      } else if (filters.pricing === 'paid') {
        const fee = (event.registrationFee || '').toLowerCase();
        if (!fee || fee.includes('free') || fee === '₹0' || fee === '0') {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && event.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.department !== 'all' ||
    filters.organization !== 'all' ||
    filters.eventType !== 'all' ||
    filters.pricing !== 'all' ||
    filters.status !== 'all'
  );

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero with Search and Quick Filters */}
      <Hero 
        onSearch={handleSearch} 
        onQuickFilter={handleQuickFilter} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Event Parameter Filter Controls Card */}
        <EventFilters 
          filters={filters}
          onChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
          onReset={() => setFilters(initialFilters)}
        />

        {/* Active Events Manifest Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Active Events Manifest
              </h2>
              <span className="text-xs font-mono bg-blue-100/70 text-blue-800 font-semibold px-2 py-0.5 rounded-xs">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Record Found' : 'Records Found'}
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              COLLECTION: <span className="text-slate-600">/institutions/nbkrist/events</span>
            </div>
          </div>

          {/* Grid Layout: Main Manifest on left, Reconciliation on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Manifest List Column */}
            <div className="lg:col-span-8 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </div>
              ) : events.length === 0 ? (
                /* Exactly matches mandated string from Section 5 & 23 */
                <EmptyState
                  title="No upcoming events yet."
                  description="NBKRIST host departments and student chapters have not published any upcoming events to the live manifest yet."
                  icon="calendar"
                  actionText="Sign In as Host to Publish Event"
                  onAction={() => navigate('/host/login')}
                />
              ) : filteredEvents.length === 0 ? (
                /* Exactly matches mandated string from Section 23 */
                <EmptyState
                  title="No events match your filters."
                  description="Try adjusting your department, category, or pricing filters to discover events scheduled at NBKRIST."
                  icon="search"
                  actionText="Clear All Filters"
                  onAction={() => setFilters(initialFilters)}
                />
              ) : (
                filteredEvents.map(event => (
                  <EventCard key={event.eventId} event={event} />
                ))
              )}
            </div>

            {/* Right Reconciliation Sidebar */}
            <div className="lg:col-span-4 sticky top-24">
              <FilterReconciliationSidebar 
                filteredCount={filteredEvents.length}
                totalCount={events.length}
              />
            </div>

          </div>
        </section>

        {/* Institutional Host Portal & Strict Whitelist Security */}
        <WhitelistSecuritySection />

      </div>

    </div>
  );
};
