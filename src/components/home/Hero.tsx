import React, { useState } from 'react';
import { Search, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { NeuralBackground } from '../common/NeuralBackground';
import { DEPARTMENTS } from '../../utils/constants';

interface HeroProps {
  onSearch: (query: string, department: string) => void;
  onQuickFilter: (filterKey: string, filterVal: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onQuickFilter }) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput, selectedDept);
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
    <section className="relative bg-[#071638] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950 overflow-hidden">
      {/* Subtle Neural Network Graphics */}
      <NeuralBackground intensity="medium" />

      <div className="relative z-10 max-w-5xl mx-auto text-left sm:text-center space-y-6">
        
        {/* Realtime Live Stream Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-sky-500/30 text-xs font-mono text-sky-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Firestore Status: Connected • Live Events Stream</span>
        </div>

        {/* Hero Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover Events at NBKRIST
          </h1>
          <p className="max-w-3xl sm:mx-auto text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed">
            Find workshops, technical events, student activities, competitions, chapter events and department activities at NBKRIST.
          </p>
        </div>

        {/* Search Bar Container */}
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl sm:mx-auto bg-white rounded-lg p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search event title, speaker, or key..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

          {/* Department Select */}
          <div className="sm:w-60">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#061530] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 sm:py-3 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <span>Search Events</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </form>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center sm:justify-center gap-2 pt-2 text-xs">
          <span className="font-mono text-[11px] text-sky-300/80 uppercase tracking-wider mr-1">
            QUICK FILTER:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              onClick={() => onQuickFilter(pill.type, pill.val)}
              type="button"
              className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-xs font-mono"
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
