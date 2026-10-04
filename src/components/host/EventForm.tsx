import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  User, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  AlertCircle, 
  ShieldCheck, 
  Save, 
  Send,
  Sparkles
} from 'lucide-react';
import { NBKRISTEvent, RegistrationMethod, EventStatus } from '../../types';
import { PosterUrlInput } from './PosterUrlInput';
import { DEPARTMENTS, EVENT_TYPES, HOST_METADATA } from '../../utils/constants';

interface EventFormProps {
  initialData?: Partial<NBKRISTEvent>;
  hostOrganization: string;
  hostEmail: string;
  onSubmit: (eventData: Omit<NBKRISTEvent, 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>, status: EventStatus) => Promise<void>;
  isEditing?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  hostOrganization,
  hostEmail,
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const hostMeta = HOST_METADATA[hostOrganization];

  const [title, setTitle] = useState(initialData?.title || '');
  const [posterUrl, setPosterUrl] = useState(initialData?.posterUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [department, setDepartment] = useState(initialData?.department || hostMeta?.department || DEPARTMENTS[0]);
  const [eventType, setEventType] = useState(initialData?.eventType || EVENT_TYPES[0]);
  
  const [date, setDate] = useState(initialData?.date || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:30 AM');
  const [endTime, setEndTime] = useState(initialData?.endTime || '04:30 PM');
  const [registrationDeadline, setRegistrationDeadline] = useState(initialData?.registrationDeadline || '');
  
  const [venue, setVenue] = useState(initialData?.venue || 'Auditorium Block A, NBKRIST Campus');
  const [registrationFee, setRegistrationFee] = useState(initialData?.registrationFee || 'Free');

  const [coordinatorName, setCoordinatorName] = useState(initialData?.coordinatorName || '');
  const [coordinatorEmail, setCoordinatorEmail] = useState(initialData?.coordinatorEmail || hostEmail);
  const [coordinatorPhone, setCoordinatorPhone] = useState(initialData?.coordinatorPhone || '');

  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>(initialData?.registrationMethod || 'googleForm');
  const [registrationUrl, setRegistrationUrl] = useState(initialData?.registrationUrl || '');
  const [registrationEmail, setRegistrationEmail] = useState(initialData?.registrationEmail || hostEmail);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (targetStatus: EventStatus) => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setError('Please provide an event title between 3 and 200 characters.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setError('Event title cannot exceed 200 characters.');
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError('Please provide a complete description for the event.');
      return;
    }

    if (!date) {
      setError('Please specify the date of the event.');
      return;
    }

    const eventDateObj = new Date(date);
    if (isNaN(eventDateObj.getTime())) {
      setError('Please enter a valid event date.');
      return;
    }

    if (registrationDeadline) {
      const deadlineObj = new Date(registrationDeadline);
      if (isNaN(deadlineObj.getTime())) {
        setError('Please enter a valid registration deadline date.');
        return;
      }
      if (deadlineObj > eventDateObj) {
        setError('Registration deadline cannot be after the event date.');
        return;
      }
    }

    const trimmedVenue = venue.trim();
    if (!trimmedVenue) {
      setError('Please enter the venue/location on campus.');
      return;
    }

    if (posterUrl.trim()) {
      try {
        const parsed = new URL(posterUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('Please provide a valid http:// or https:// URL for the poster image.');
          return;
        }
      } catch {
        setError('Please provide a valid URL for the poster image.');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (registrationMethod === 'email') {
      if (!registrationEmail.trim() || !emailRegex.test(registrationEmail.trim())) {
        setError('Please specify a valid registration contact email address.');
        return;
      }
    } else {
      if (!registrationUrl.trim() || !registrationUrl.startsWith('http')) {
        setError('Please enter a valid URL beginning with https:// or http:// for registration.');
        return;
      }
    }

    if (coordinatorEmail.trim() && !emailRegex.test(coordinatorEmail.trim())) {
      setError('Please enter a valid email format for the coordinator.');
      return;
    }

    if (coordinatorPhone.trim()) {
      const digitsOnly = coordinatorPhone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        setError('Please enter a valid coordinator contact phone number (at least 10 digits).');
        return;
      }
    }

    if (registrationFee.trim()) {
      const numMatch = registrationFee.match(/-?\d+(\.\d+)?/);
      if (numMatch && parseFloat(numMatch[0]) < 0) {
        setError('Registration fee cannot be negative.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        posterUrl,
        description: description.trim(),
        organization: hostOrganization, // Strictly locked to host
        organizationId: hostOrganization.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        department,
        eventType,
        date,
        startTime,
        endTime,
        registrationDeadline,
        venue: venue.trim(),
        registrationFee: registrationFee.trim(),
        coordinatorName: coordinatorName.trim(),
        coordinatorEmail: coordinatorEmail.trim(),
        coordinatorPhone: coordinatorPhone.trim(),
        registrationMethod,
        registrationUrl: registrationMethod !== 'email' ? registrationUrl.trim() : '',
        registrationEmail: registrationMethod === 'email' ? registrationEmail.trim() : '',
        status: targetStatus
      }, targetStatus);
    } catch (err: any) {
      let msg = err.message || 'Failed to save event to database.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error && (parsed.error.includes('Missing or insufficient permissions') || parsed.error.includes('permission-denied'))) {
          msg = 'Firestore Permission Notice: The event could not be published because Firestore security rules in your Firebase project need to allow this action. Please publish the rules from firestore.rules into your Firebase Console.';
        }
      } catch {
        // Not a JSON error
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Event Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">1. Event Information</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">ORGANIZATION BOUND</span>
        </div>

        {/* Locked Organization */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
            Host Organization (System Enforced)
          </label>
          <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{hostOrganization}</span>
            <span className="ml-auto text-[10px] font-mono text-slate-500 font-normal">
              Immutable
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. TechTatav 2025: National Level Technical Symposium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Poster Image URL */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1" htmlFor="posterUrl">
            Poster Image URL
          </label>
          <PosterUrlInput
            value={posterUrl}
            onChange={(url) => setPosterUrl(url)}
          />
        </div>

        {/* Department & Event Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Collegiate Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Event Classification *
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
            Event Description & Syllabus *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Detailed overview of tracks, paper presentation topics, coding rounds, project exhibition guidelines, speaker credentials, and attendee requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 leading-relaxed"
          ></textarea>
        </div>

      </div>

      {/* Section 2: Schedule & Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">2. Schedule & Timeline</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">CALENDAR</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Event Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Start Time *
            </label>
            <input
              type="text"
              placeholder="e.g. 09:30 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              End Time
            </label>
            <input
              type="text"
              placeholder="e.g. 04:30 PM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Registration Deadline
            </label>
            <input
              type="text"
              placeholder="e.g. March 25, 2025"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Location & Pricing */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">3. Location & Pricing</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">VENUE / FEES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Venue / Campus Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Auditorium Block A, NBKRIST Campus"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Registration Fee *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free or ₹250 / Delegate"
              value={registrationFee}
              onChange={(e) => setRegistrationFee(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Coordinator Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">4. Coordinator Contacts</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">CONTACT PERSON</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Student / Lead Coordinator Name
            </label>
            <input
              type="text"
              placeholder="e.g. K. Sai Vamsi"
              value={coordinatorName}
              onChange={(e) => setCoordinatorName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Coordinator Email
            </label>
            <input
              type="email"
              placeholder="e.g. csenbkrist@nbkrist.org"
              value={coordinatorEmail}
              onChange={(e) => setCoordinatorEmail(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Coordinator Phone
            </label>
            <input
              type="text"
              placeholder="e.g. +91 94402 8XXXX"
              value={coordinatorPhone}
              onChange={(e) => setCoordinatorPhone(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Registration Destination (Section 8 & 15) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">5. Registration Routing Method</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">EXTERNAL DISPATCH</span>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
            Select Method *
          </label>
          <select
            value={registrationMethod}
            onChange={(e) => setRegistrationMethod(e.target.value as RegistrationMethod)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="googleForm">Google Form</option>
            <option value="externalWebsite">External Website</option>
            <option value="microsoftForm">Microsoft Form</option>
            <option value="email">Email (mailto client)</option>
          </select>
        </div>

        {registrationMethod === 'email' ? (
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Registration Email Destination *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. csenbkrist@nbkrist.org"
              value={registrationEmail}
              onChange={(e) => setRegistrationEmail(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              When clicked, delegates will open their email client pre-addressed to this endpoint with pre-filled student registration template.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Registration Form / Website URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://forms.google.com/..."
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Delegates will be redirected securely in a new browser tab to this URL.
            </p>
          </div>
        )}

      </div>

      {/* Action Submission Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/host/events')}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit('draft')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-slate-600" />
          <span>Save as Draft</span>
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit('registration_open')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#091e42] hover:bg-[#071733] rounded-md shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>{isEditing ? 'Save & Publish Updates' : 'Publish to Events Hub'}</span>
        </button>
      </div>

    </form>
  );
};
