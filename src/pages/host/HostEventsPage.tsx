import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  Edit3, 
  Settings2, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToHostEvents, deleteInstitutionalEvent, updateEventStatus } from '../../lib/firestore';
import { NBKRISTEvent, EventStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageLoadingState } from '../../components/common/LoadingState';

export const HostEventsPage: React.FC = () => {
  const { user, hostProfile } = useAuth();
  const [events, setEvents] = useState<NBKRISTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<NBKRISTEvent | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeTab = searchParams.get('filter') || 'all';

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToHostEvents(
      user.uid,
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore host events notice:", err?.message || err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredEvents = events.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return e.status === 'draft';
    if (activeTab === 'published') return ['published', 'registration_open', 'registration_closed'].includes(e.status);
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInstitutionalEvent(deleteTarget.eventId);
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete event.');
    }
  };

  const handleToggleRegistration = async (event: NBKRISTEvent) => {
    try {
      const nextStatus: EventStatus = event.status === 'registration_open' ? 'registration_closed' : 'registration_open';
      await updateEventStatus(event.eventId, nextStatus);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update registration status.');
    }
  };

  if (loading) {
    return <PageLoadingState message="Retrieving Authorized Event Records..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Events Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Published, drafted, and archived events for <strong>{hostProfile?.organization}</strong>
          </p>
        </div>

        <Link
          to="/host/events/create"
          className="inline-flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-sky-400" />
          <span>Create New Event</span>
        </Link>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        {[
          { id: 'all', label: 'All Events', count: events.length },
          { id: 'published', label: 'Published', count: events.filter(e => ['published', 'registration_open', 'registration_closed'].includes(e.status)).length },
          { id: 'draft', label: 'Drafts', count: events.filter(e => e.status === 'draft').length },
          { id: 'completed', label: 'Completed', count: events.filter(e => e.status === 'completed').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams(tab.id === 'all' ? {} : { filter: tab.id })}
            className={`pb-3 px-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <EmptyState
          title="You haven't created any events yet."
          description="Click the button above to begin scheduling an official departmental symposium, workshop, or technical event."
          icon="calendar"
          actionText="Create First Event"
          onAction={() => window.location.href = '/host/events/create'}
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No events in this category."
          description="There are currently no events matching the selected tab filter."
          icon="calendar"
          actionText="Show All Events"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {filteredEvents.map((event) => (
            <div key={event.eventId} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {event.title}
                  </span>
                  <StatusBadge status={event.status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="font-mono text-blue-700 font-semibold">{event.eventType}</span>
                  <span>•</span>
                  <span>📅 {event.date} {event.startTime ? `(${event.startTime})` : ''}</span>
                  <span>•</span>
                  <span>📍 {event.venue || 'Campus'}</span>
                  <span>•</span>
                  <span>Fee: <strong className="text-slate-700">{event.registrationFee || 'Free'}</strong></span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                  {event.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                
                {/* Registration toggle */}
                {['published', 'registration_open', 'registration_closed'].includes(event.status) && (
                  <button
                    onClick={() => handleToggleRegistration(event)}
                    type="button"
                    title={event.status === 'registration_open' ? 'Close Registration' : 'Reopen Registration'}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                      event.status === 'registration_open'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {event.status === 'registration_open' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Close Reg</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Reopen Reg</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  to={`/events/${event.eventId}`}
                  target="_blank"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                  title="View Public Event Page"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <Link
                  to={`/host/events/${event.eventId}/edit`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </Link>

                <Link
                  to={`/host/events/${event.eventId}/manage`}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </Link>

                <button
                  onClick={() => setDeleteTarget(event)}
                  type="button"
                  title="Delete Event"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Permanently Delete Event?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the event from the public events hub.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
