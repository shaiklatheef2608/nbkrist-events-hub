import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EventForm } from '../../components/host/EventForm';
import { createInstitutionalEvent } from '../../lib/firestore';
import { NBKRISTEvent, EventStatus } from '../../types';
import { APPROVED_HOSTS } from '../../utils/constants';
import { PlusCircle, ShieldCheck } from 'lucide-react';

export const HostCreateEventPage: React.FC = () => {
  const { user, hostProfile } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (
    data: Omit<NBKRISTEvent, 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>,
    status: EventStatus
  ) => {
    if (!user) throw new Error('Host session not authenticated.');

    const normalizedEmail = (user.email || '').toLowerCase().trim();
    const org = hostProfile?.organization || APPROVED_HOSTS[normalizedEmail] || 'NBKRIST Host';

    await createInstitutionalEvent(
      {
        ...data,
        status
      },
      user.uid,
      org
    );

    navigate('/host/events');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
          <span>HOST OPERATIONS</span>
          <span>/</span>
          <span>NEW EVENT MANIFEST</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Create Collegiate Event
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Schedule and publish a technical symposium, workshop, or student competition on behalf of <strong>{hostProfile?.organization}</strong>.
        </p>
      </div>

      <EventForm
        hostOrganization={hostProfile?.organization || 'NBKRIST Host'}
        hostEmail={hostProfile?.email || user?.email || ''}
        onSubmit={handleCreate}
      />

    </div>
  );
};
