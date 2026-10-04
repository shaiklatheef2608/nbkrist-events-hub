import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Settings2, 
  ArrowLeft, 
  Calendar, 
  Link2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEventById, updateEventStatus, updateInstitutionalEvent, deleteInstitutionalEvent } from '../../lib/firestore';
import { NBKRISTEvent, EventStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageLoadingState } from '../../components/common/LoadingState';

export const HostManageEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, hostProfile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<NBKRISTEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRegUrl, setNewRegUrl] = useState('');
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!eventId || !user) return;
      try {
        const doc = await getEventById(eventId);
        if (!doc) {
          setError('Event not found.');
        } else if (doc.createdBy !== user.uid) {
          setError('Permission Denied: You can only manage events created by your host organization.');
        } else {
          setEvent(doc);
          setNewRegUrl(doc.registrationUrl || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch event.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId, user]);

  const handleStatusChange = async (targetStatus: EventStatus) => {
    if (!eventId || !user) return;
    try {
      await updateEventStatus(eventId, targetStatus);
      setEvent(prev => prev ? { ...prev, status: targetStatus } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update event state.');
    }
  };

  const handleUrlUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !user || !event) return;

    setIsUpdatingUrl(true);
    try {
      await updateInstitutionalEvent(eventId, {
        registrationUrl: newRegUrl.trim()
      }, user.uid);
      setEvent(prev => prev ? { ...prev, registrationUrl: newRegUrl.trim() } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update registration URL.');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    try {
      await deleteInstitutionalEvent(eventId);
      navigate('/host/events');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event.');
    }
  };

  if (loading) {
    return <PageLoadingState message="Loading Event Management Console..." />;
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">{error || 'Event Not Found'}</h3>
        <Link to="/host/events" className="text-xs text-blue-700 hover:underline">
          Return to Events List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/host/events')}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manage: {event.title}
            </h1>
            <StatusBadge status={event.status} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${event.eventId}`}
            target="_blank"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>Public View</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            to={`/host/events/${event.eventId}/edit`}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Fields</span>
          </Link>
        </div>
      </div>

      {/* Lifecycle Actions Card (Section 16) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Event Lifecycle Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Publish / Unpublish */}
          {event.status === 'draft' ? (
            <button
              onClick={() => handleStatusChange('published')}
              className="p-3 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Publish Event</span>
              <CheckCircle className="w-4 h-4 text-sky-600" />
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('draft')}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Revert to Draft</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Close / Reopen Registration */}
          {event.status === 'registration_open' ? (
            <button
              onClick={() => handleStatusChange('registration_closed')}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Close Registration</span>
              <XCircle className="w-4 h-4 text-amber-600" />
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('registration_open')}
              className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Open Registration</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Mark as Completed */}
          {event.status !== 'completed' ? (
            <button
              onClick={() => handleStatusChange('completed')}
              className="p-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Mark as Completed</span>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('published')}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Reactivate Event</span>
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete Action with Dialog */}
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span>Delete Event</span>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>

        </div>
      </div>

      {/* Quick Update Registration URL (Section 16) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-700" />
          <span>Update Registration URL</span>
        </h3>

        <form onSubmit={handleUrlUpdate} className="space-y-3">
          <p className="text-xs text-slate-500">
            Quickly update the Google Form, MS Form, or external registration destination URL without editing the entire event manifest.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={newRegUrl}
              onChange={(e) => setNewRegUrl(e.target.value)}
              placeholder="https://forms.google.com/..."
              className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isUpdatingUrl}
              className="bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-4 py-2.5 rounded-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isUpdatingUrl ? 'Updating...' : 'Update URL'}
            </button>
          </div>
        </form>
      </div>

      {/* Institutional Metadata Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>AUTHORIZATION INVARIANT</span>
        </div>
        <p>
          Event ID: <strong className="font-mono text-slate-800">{event.eventId}</strong>
        </p>
        <p>
          Assigned Host: <strong className="text-slate-800">{event.organization}</strong>
        </p>
        <p>
          Created by UID: <strong className="font-mono text-slate-800">{event.createdBy}</strong>
        </p>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Permanently Delete Event?"
        message={`This action cannot be undone. Are you sure you wish to delete "${event.title}" from the NBKRIST Events Hub?`}
        confirmText="Confirm Deletion"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

    </div>
  );
};
