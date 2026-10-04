import React from 'react';
import { Link } from 'react-router-dom';
import { Network, Info, ShieldCheck, KeyRound } from 'lucide-react';

interface FilterReconciliationSidebarProps {
  filteredCount: number;
  totalCount: number;
}

export const FilterReconciliationSidebar: React.FC<FilterReconciliationSidebarProps> = ({
  filteredCount,
  totalCount
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
        <span>FILTER RECONCILIATION</span>
        <span className="text-slate-400">INDEX #002</span>
      </div>

      {/* Center Reconciliation Status */}
      <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-md text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center mx-auto">
          <Network className="w-5 h-5 text-blue-700" />
        </div>

        <h4 className="text-xs font-bold text-slate-800">
          {filteredCount === 0 ? 'No events match current filter' : 'Filter synchronized with manifest'}
        </h4>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Firestore collection <code className="text-slate-700 font-mono">'events'</code> is synchronized with the Autonomous Central Registry.
        </p>
      </div>

      {/* Institutional notice */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Approved host organizations can schedule and publish verified departmental events via the secure <strong>Host Portal</strong>.
        </p>
      </div>

      {/* Security Status Indicator */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">HOST SECURITY CHECK:</span>
        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          ACTIVE
        </span>
      </div>

      {/* Action Button */}
      <Link
        to="/host/login"
        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold py-2.5 rounded-md border border-slate-200 transition-colors"
      >
        <KeyRound className="w-3.5 h-3.5 text-slate-600" />
        <span>Authenticate as Department Organizer</span>
      </Link>
    </div>
  );
};
