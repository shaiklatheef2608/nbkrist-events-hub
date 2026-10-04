import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      {/* 16:9 top poster placeholder */}
      <div className="w-full aspect-16/9 bg-slate-200"></div>

      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-slate-200"></div>
          <div className="w-24 h-4 rounded bg-slate-200"></div>
          <div className="w-16 h-3 rounded bg-slate-200"></div>
        </div>
        <div className="w-20 h-4 rounded-full bg-slate-200"></div>
      </div>

      <div className="p-5 space-y-3">
        <div className="w-1/3 h-3 bg-slate-200 rounded"></div>
        <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
        <div className="w-full h-8 bg-slate-100 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <div className="h-10 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="w-28 h-4 bg-slate-200 rounded"></div>
        <div className="w-24 h-7 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
};

export const PageLoadingState: React.FC<{ message?: string }> = ({ 
  message = "Connecting to NBKRIST Central Database..." 
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-blue-200 border-t-blue-800 animate-spin"></div>
      </div>
      <p className="text-xs font-mono text-slate-500 tracking-wider uppercase">
        {message}
      </p>
    </div>
  );
};
