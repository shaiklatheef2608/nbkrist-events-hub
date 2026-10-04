import React from 'react';
import { SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';
import { FilterState } from '../../types';
import { DEPARTMENTS, APPROVED_ORGANIZATIONS, EVENT_TYPES } from '../../utils/constants';

interface EventFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const activeChips: { key: keyof FilterState; label: string; value: string }[] = [];

  if (filters.department && filters.department !== 'all') {
    activeChips.push({ key: 'department', label: 'Dept', value: filters.department });
  }
  if (filters.organization && filters.organization !== 'all') {
    activeChips.push({ key: 'organization', label: 'Host', value: filters.organization });
  }
  if (filters.eventType && filters.eventType !== 'all') {
    activeChips.push({ key: 'eventType', label: 'Type', value: filters.eventType });
  }
  if (filters.pricing && filters.pricing !== 'all') {
    activeChips.push({ 
      key: 'pricing', 
      label: 'Pricing', 
      value: filters.pricing === 'free' ? 'Free Events' : 'Paid Delegations' 
    });
  }
  if (filters.status && filters.status !== 'all') {
    activeChips.push({ 
      key: 'status', 
      label: 'Status', 
      value: filters.status === 'registration_open' ? 'Registration Open' : filters.status 
    });
  }
  if (filters.searchQuery) {
    activeChips.push({ key: 'searchQuery', label: 'Search', value: filters.searchQuery });
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 sm:p-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-700" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Event Parameter Filters</h3>
          <span className="text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-xs">
            Real-Time Sync
          </span>
        </div>

        {activeChips.length > 0 && (
          <button
            onClick={onReset}
            type="button"
            className="text-xs text-slate-500 hover:text-blue-700 flex items-center gap-1 transition-colors font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Select Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Department Filter */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ department: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter / Organization Filter */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
            Chapter / Body
          </label>
          <select
            value={filters.organization}
            onChange={(e) => onChange({ organization: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Recognized Chapters</option>
            {APPROVED_ORGANIZATIONS.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
            Event Type
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => onChange({ eventType: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Categories</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Filter */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
            Delegate Pricing
          </label>
          <select
            value={filters.pricing}
            onChange={(e) => onChange({ pricing: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Pricing Tiers</option>
            <option value="free">Free Events Only</option>
            <option value="paid">Paid Delegations</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="registration_open">Registration Open</option>
            <option value="published">Published</option>
            <option value="registration_closed">Registration Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Active Constraints */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Active Constraints:
          </span>
          {activeChips.map((chip) => (
            <span
              key={`${chip.key}-${chip.value}`}
              className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-900 border border-blue-200/80 px-2.5 py-0.5 rounded-xs font-medium"
            >
              <span>{chip.label}: {chip.value}</span>
              <button
                type="button"
                onClick={() => onChange({ [chip.key]: chip.key === 'searchQuery' ? '' : 'all' })}
                className="text-blue-700 hover:text-blue-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
