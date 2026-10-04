import React from 'react';
import { CalendarX, SearchX, Layers, ShieldAlert, Sparkles, FolderX } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'calendar' | 'search' | 'events' | 'shield';
  variant?: 'card' | 'page';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No upcoming events yet.",
  description = "Events scheduled by NBKRIST departments and student chapters will be displayed here once published.",
  actionText,
  onAction,
  icon = 'calendar',
  variant = 'card'
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <SearchX className="w-8 h-8 text-slate-400" />;
      case 'events':
        return <FolderX className="w-8 h-8 text-slate-400" />;
      case 'shield':
        return <ShieldAlert className="w-8 h-8 text-slate-400" />;
      case 'calendar':
      default:
        return <CalendarX className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-white text-center p-8 sm:p-12 ${
      variant === 'page' ? 'min-h-[400px] flex flex-col items-center justify-center' : ''
    }`}>
      <NeuralBackground intensity="subtle" className="opacity-10" />

      <div className="relative z-10 max-w-md mx-auto space-y-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-600 shadow-2xs">
          {getIcon()}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>

        {actionText && onAction && (
          <div className="pt-2">
            <button
              onClick={onAction}
              type="button"
              className="inline-flex items-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <span>{actionText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
