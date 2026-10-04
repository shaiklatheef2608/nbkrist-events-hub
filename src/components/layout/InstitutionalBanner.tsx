import React from 'react';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

export const InstitutionalBanner: React.FC = () => {
  return (
    <div className="bg-[#050d1d] text-slate-300 text-[11px] font-mono border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sky-400 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            INSTITUTIONAL PORTAL
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">NAAC 'A' GRADE & NBA ACCREDITED (AUTONOMOUS)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">VIDYANAGAR, TIRUPATI DIST., AP</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-sm border border-slate-800">
            <Lock className="w-3 h-3 text-sky-400" />
            <span>Secure Domain Whitelist: <strong className="text-white">@nbkrist.org</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>OFFICIAL CAMPUS PORTAL • ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
