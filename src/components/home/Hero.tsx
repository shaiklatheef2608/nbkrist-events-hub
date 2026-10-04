import React, { useState } from 'react';
import { Search, ArrowRight, Calendar, Filter } from 'lucide-react';
import { NeuralBackground } from '../common/NeuralBackground';
import { EVENT_TYPES } from '../../utils/constants';

export interface HeroSearchParams {
  query: string;
  eventType: string;
  date: string;
}

interface HeroProps {
  onSearch: (params: HeroSearchParams) => void;
  onQuickFilter?: (filterKey: string, filterVal: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onQuickFilter }) => {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('all');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query: query.trim(),
      eventType,
      date
    });
  };

  const quickPills = [
    { label: 'Workshops', type: 'eventType', val: 'Workshop & Hands-On' },
    { label: 'Hackathons', type: 'eventType', val: 'Hackathon & Coding Contest' },
    { label: 'Guest Lectures', type: 'eventType', val: 'Guest Lecture & Tech Talk' },
    { label: 'Symposiums', type: 'eventType', val: 'Technical Symposium' },
    { label: 'IEEE Student Branch', type: 'organization', val: 'IEEE NBKRIST' },
    { label: 'CSE Department', type: 'organization', val: 'CSE NBKRIST' }
  ];

  return (
    <section className="relative bg-[#071638] text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950 overflow-hidden">
      {/* Subtle Neural Network Graphics */}
      <NeuralBackground intensity="medium" />

      <div className="relative z-10 max-w-4xl mx-auto text-left sm:text-center space-y-6">
        
        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to NBKRIST
          </h1>
          <p className="max-w-2xl sm:mx-auto text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed">
            Find workshops, technical events, student activities, competitions, chapter events and department activities at NBKRIST.
          </p>
        </div>

        {/* Hero Form Structure */}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-3xl sm:mx-auto">
          
          {/* Row 1: Search Input Bar Unit with Search Button on Right */}
          <div className="bg-white rounded-lg p-2 shadow-2xl flex items-center gap-2 text-slate-800 border border-slate-200">
            <div className="flex-1 relative flex items-center">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search event title, speaker, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden rounded-md"
              />
            </div>
            <button
              type="submit"
              className="bg-[#091e42] hover:bg-[#061530] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-md transition-colors cursor-pointer shrink-0 inline-flex items-center gap-2 shadow-sm"
            >
              <span>Search Events</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Row 2: Downside Filters (Event Type & Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. Event Type Filter */}
            <div className="bg-white/95 backdrop-blur-xs rounded-md px-3.5 py-2.5 border border-white/20 shadow-md flex items-center justify-between text-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-700" />
                <span>Event Type:</span>
              </span>
              <select
                value={eventType}
                aria-label="Event Type"
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Event Types</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Date Filter */}
            <div className="bg-white/95 backdrop-blur-xs rounded-md px-3.5 py-2.5 border border-white/20 shadow-md flex items-center justify-between text-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Date:</span>
              </span>
              <input
                type="date"
                aria-label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              />
            </div>

          </div>

        </form>

        {/* Quick Filter Chips */}
        {onQuickFilter && (
          <div className="flex flex-wrap items-center sm:justify-center gap-2 pt-1 text-xs">
            <span className="font-mono text-[11px] text-sky-300/80 uppercase tracking-wider mr-1">
              QUICK FILTER:
            </span>
            {quickPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onQuickFilter(pill.type, pill.val)}
                type="button"
                className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-xs font-mono cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
