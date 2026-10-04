import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EventForm } from '../../components/host/EventForm';
import { getEventById, updateInstitutionalEvent } from '../../lib/firestore';
import { NBKRISTEvent, EventStatus } from '../../types';
import { PageLoadingState } from '../../components/common/LoadingState';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const HostEditEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, hostProfile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<NBKRISTEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!eventId || !user) return;
      try {
        const doc = await getEventById(eventId);
        if (!doc) {
          setError('Event not found.');
        } else if (doc.createdBy !== user.uid) {
          setError('Permission Denied: You can only edit events created by your own host organization.');
        } else {
          setEvent(doc);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load event data.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId, user]);

  const handleUpdate = async (
    data: Omit<NBKRISTEvent, 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>,
    status: EventStatus
  ) => {
    if (!eventId || !user) return;

    await updateInstitutionalEvent(eventId, {
      ...data,
      status
    }, user.uid);

    navigate('/host/events');
  };

  if (loading) {
    return <PageLoadingState message="Loading Event Data for Editing..." />;
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Unable to Edit Event</h3>
        <p className="text-xs text-slate-500">{error || 'Event not found.'}</p>
        <button
          onClick={() => navigate('/host/events')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Host Events</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
          <span>HOST OPERATIONS</span>
          <span>/</span>
          <span>EDIT EVENT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Edit: {event.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Modifying official event document registered under <strong>{hostProfile?.organization}</strong>.
        </p>
      </div>

      <EventForm
        initialData={event}
        hostOrganization={hostProfile?.organization || event.organization}
        hostEmail={hostProfile?.email || user?.email || ''}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </div>
  );
};
