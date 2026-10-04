import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Info, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { NeuralBackground } from '../../components/common/NeuralBackground';

export const MyRegistrationsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
          <span>STUDENT & DELEGATE SERVICES</span>
          <span>/</span>
          <span>REGISTRATION PORTFOLIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Registrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track verified admissions, delegate passes, and event registrations.
        </p>
      </div>

      {/* Main Empty State Container */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
        <NeuralBackground intensity="subtle" className="opacity-15" />

        <div className="relative z-10 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mx-auto shadow-2xs">
            <BookmarkCheck className="w-8 h-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Registration Tracking
          </h2>

          {/* Mandated display string from Section 22 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Your registrations will appear here when registration tracking is supported.
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            NBKRIST Events Hub currently routes student registrations directly to department-managed platforms (official Google Forms, MS Forms, or direct coordinator correspondence). Keep the confirmation emails sent by the event coordinators for venue admission.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Institutional Assurance */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Autonomous Institution Verification:</strong> All event coordinators listed on the Hub are authorized NBKRIST faculty members or registered student chapter leads.
        </div>
      </div>

    </div>
  );
};
