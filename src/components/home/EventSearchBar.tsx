import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { EVENT_TYPES } from '../../utils/constants';

interface EventSearchBarProps {
  onSearch: (params: {
    query: string;
    startDate: string;
    endDate: string;
    category: string;
  }) => void;
}

export const EventSearchBar: React.FC<EventSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query: query.trim(),
      startDate,
      endDate,
      category
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      <form 
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
      >
        {/* 1. Search text input */}
        <div className="lg:col-span-3 relative">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-4 pr-10 bg-white border border-slate-300 text-slate-800 text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-[#0b5c9e] shadow-2xs transition-colors rounded-none"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* 2. Select Start Date */}
        <div className="lg:col-span-2 relative">
          <input
            type="date"
            placeholder="Select Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-12 px-3.5 bg-white border border-slate-300 text-slate-700 text-sm focus:outline-hidden focus:border-[#0b5c9e] shadow-2xs transition-colors rounded-none"
          />
        </div>

        {/* 3. Select End Date */}
        <div className="lg:col-span-2 relative">
          <input
            type="date"
            placeholder="Select End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-12 px-3.5 bg-white border border-slate-300 text-slate-700 text-sm focus:outline-hidden focus:border-[#0b5c9e] shadow-2xs transition-colors rounded-none"
          />
        </div>

        {/* 4. Select Category Dropdown */}
        <div className="lg:col-span-3 relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 pl-4 pr-9 bg-white border border-slate-300 text-slate-700 text-sm focus:outline-hidden focus:border-[#0b5c9e] shadow-2xs appearance-none cursor-pointer rounded-none"
          >
            <option value="all">Select Category</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* 5. Find Event Button */}
        <div className="lg:col-span-2">
          <button
            type="submit"
            className="w-full h-12 bg-[#0b5c9e] hover:bg-[#084980] text-white font-medium text-sm flex items-center justify-center gap-2 px-5 shadow-sm transition-colors cursor-pointer rounded-none"
          >
            <span>Find Event</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};
