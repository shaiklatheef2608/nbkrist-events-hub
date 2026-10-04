import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Settings, 
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToHostEvents } from '../../lib/firestore';
import { NBKRISTEvent } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoadingState } from '../../components/common/LoadingState';
import { HOST_METADATA } from '../../utils/constants';

export const HostDashboardPage: React.FC = () => {
  const { user, hostProfile } = useAuth();
  const [events, setEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToHostEvents(
      user.uid,
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Notice fetching host events:", err?.message || err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <PageLoadingState message="Loading Host Event Portfolio..." />;
  }

  const publishedCount = events.filter(e => ['published', 'registration_open', 'registration_closed'].includes(e.status)).length;
  const draftsCount = events.filter(e => e.status === 'draft').length;
  const registrationOpenCount = events.filter(e => e.status === 'registration_open').length;
  const completedCount = events.filter(e => e.status === 'completed').length;

  const orgName = hostProfile?.organization || 'NBKRIST Department Host';
  const meta = HOST_METADATA[orgName];

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#071638] to-[#0a2254] rounded-xl p-6 sm:p-8 text-white border border-blue-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-sky-950/80 border border-sky-700/60 px-2.5 py-0.5 rounded-xs text-[11px] font-mono text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>ORGANIZER PORTAL • {meta?.type || 'ACADEMIC BODY'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {orgName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your departmental symposiums, workshops, and technical events with verified @nbkrist.org institutional authorization.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
          <Link
            to="/host/events/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/events"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-md border border-slate-700 transition-colors"
          >
            <span>View Public Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Real Real-time Statistics Cards (No fake metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {events.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Authored by {orgName}</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {publishedCount}
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block">Live on NBKRIST Hub</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
            <span>Open Registration</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {registrationOpenCount}
          </div>
          <span className="text-[10px] text-sky-600 mt-1 block">Accepting Student Entries</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
            <span>Drafts</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {draftsCount}
          </div>
          <span className="text-[10px] text-amber-600 mt-1 block">Unpublished Work</span>
        </div>

      </div>

      {/* Recent Events & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Recent Events</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official published events and drafts registered under your department
            </p>
          </div>

          <Link
            to="/host/events"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="You haven't created any events yet."
            description={`As an authorized organizer for ${orgName}, you can publish symposia, hackathons, and seminars directly to the campus hub.`}
            icon="calendar"
            actionText="Create First Event"
            onAction={() => window.location.href = '/host/events/create'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {events.slice(0, 5).map((event) => (
              <div key={event.eventId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {event.title}
                    </span>
                    <StatusBadge status={event.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono text-[11px]">
                    <span>📅 {event.date}</span>
                    <span>•</span>
                    <span>📍 {event.venue || 'NBKRIST Campus'}</span>
                    <span>•</span>
                    <span className="text-blue-700 font-medium">{event.registrationMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/host/events/${event.eventId}/manage`}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                  >
                    Manage
                  </Link>
                  <Link
                    to={`/host/events/${event.eventId}/edit`}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
