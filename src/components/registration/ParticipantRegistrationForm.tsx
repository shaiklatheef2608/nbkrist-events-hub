import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { 
  NBKRISTEvent, 
  RegistrationFormDefinition, 
  EventRegistration 
} from '../../types';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { PaymentBlockView } from './PaymentBlockView';
import { getHiddenQuestionIds, getNextSectionId } from '../../utils/logicEngine';
import { submitEventRegistration } from '../../lib/firestore';

interface ParticipantRegistrationFormProps {
  event: NBKRISTEvent;
  formDefinition: RegistrationFormDefinition;
  user: { uid: string; email?: string | null };
  onSuccess?: (registrationId: string) => void;
}

export const ParticipantRegistrationForm: React.FC<ParticipantRegistrationFormProps> = ({
  event,
  formDefinition,
  user,
  onSuccess
}) => {
  const navigate = useNavigate();

  // Sort sections by displayOrder
  const sections = useMemo(() => {
    return [...(formDefinition.sections || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [formDefinition.sections]);

  // Section index tracking
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Form answer state initialized with user email if available
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    const emailField = formDefinition.questions.find(q => q.type === 'email');
    if (emailField && user.email) {
      init[emailField.id] = user.email;
    }
    return init;
  });

  // Payment state
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confirmation screen state
  const [confirmedReg, setConfirmedReg] = useState<{
    registrationId: string;
    eventTitle: string;
    participantName: string;
    paymentStatus: string;
  } | null>(null);

  const activeSection = sections[currentSectionIndex] || {
    id: 'default',
    title: 'Registration Form',
    displayOrder: 1
  };

  // Evaluate conditional branching for questions in current section
  const hiddenQuestionIds = useMemo(() => {
    return getHiddenQuestionIds(formDefinition.questions || [], formDefinition.logicRules || [], answers);
  }, [formDefinition.questions, formDefinition.logicRules, answers]);

  // Questions belonging to the active section and currently visible
  const activeQuestions = useMemo(() => {
    return (formDefinition.questions || [])
      .filter(q => q.sectionId === activeSection.id && !hiddenQuestionIds.has(q.id))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [formDefinition.questions, activeSection.id, hiddenQuestionIds]);

  const isLastSection = currentSectionIndex === sections.length - 1;
  const showPaymentOnLastSection = isLastSection && formDefinition.paymentSettings?.enabled;

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Validate current section
  const validateCurrentSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    activeQuestions.forEach(q => {
      if (['image', 'section'].includes(q.type)) return;

      const val = answers[q.id];

      if (q.required) {
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = `${q.label} is required.`;
          return;
        }
        if (Array.isArray(val) && val.length === 0) {
          newErrors[q.id] = `Please select at least one option.`;
          return;
        }
        if (q.type === 'agreement' && val !== true) {
          newErrors[q.id] = `You must agree to continue.`;
          return;
        }
      }

      // Type-specific validations
      if (val && q.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          newErrors[q.id] = 'Please provide a valid email address.';
        }
      }

      if (val && q.type === 'phone') {
        const digits = String(val).replace(/\D/g, '');
        if (digits.length < 10) {
          newErrors[q.id] = 'Please enter a valid 10-digit mobile number.';
        }
      }
    });

    if (showPaymentOnLastSection) {
      if (formDefinition.paymentSettings.transactionIdRequired && !transactionId.trim()) {
        newErrors['payment_tid'] = 'Please enter your UPI transaction / UTR reference ID.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Next Section Navigation with Logic branching
  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }

    const { nextSectionId, isEnded } = getNextSectionId(
      activeSection.id,
      sections,
      formDefinition.logicRules || [],
      answers
    );

    if (isEnded || isLastSection) {
      handleSubmit();
      return;
    }

    if (nextSectionId) {
      const nextIdx = sections.findIndex(s => s.id === nextSectionId);
      if (nextIdx !== -1) {
        setCurrentSectionIndex(nextIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Default sequential step
    if (currentSectionIndex + 1 < sections.length) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Registration
  const handleSubmit = async () => {
    if (!validateCurrentSection()) return;

    setSubmitting(true);
    setSubmitError(null);

    // Derive participant name from answers
    let participantName = 'Participant';
    const nameKey = Object.keys(answers).find(k => k.toLowerCase().includes('name') || k.includes('q-fullname'));
    if (nameKey && answers[nameKey]) {
      participantName = String(answers[nameKey]).trim();
    }

    try {
      const paymentData = formDefinition.paymentSettings?.enabled ? {
        enabled: true,
        amount: formDefinition.paymentSettings.amount,
        currency: formDefinition.paymentSettings.currency || '₹',
        transactionId: transactionId.trim(),
        screenshotUrl: screenshotUrl.trim()
      } : undefined;

      const regId = await submitEventRegistration(
        event.eventId,
        event,
        user.uid,
        user.email || 'participant@nbkrist.org',
        participantName,
        formDefinition.version || 1,
        answers,
        paymentData
      );

      setConfirmedReg({
        registrationId: regId,
        eventTitle: event.title,
        participantName,
        paymentStatus: formDefinition.paymentSettings?.enabled ? 'Payment Pending Verification' : 'Confirmed (Free Event)'
      });

      if (onSuccess) {
        onSuccess(regId);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setSubmitError(err?.message || "Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 18. PARTICIPANT CONFIRMATION SCREEN
  if (confirmedReg) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Registration Successful
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            You're Registered!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Your delegate admission request has been recorded into the NBKRIST Central Events Registry.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-left space-y-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-1">
            <span className="font-mono text-slate-400 uppercase text-[10px]">Event</span>
            <span className="font-bold text-slate-900 text-sm">{confirmedReg.eventTitle}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-1">
            <span className="font-mono text-slate-400 uppercase text-[10px]">Participant</span>
            <span className="font-semibold text-slate-800">{confirmedReg.participantName}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-1">
            <span className="font-mono text-slate-400 uppercase text-[10px]">Registration ID</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 select-all">
              {confirmedReg.registrationId}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-mono text-slate-400 uppercase text-[10px]">Payment Status</span>
            <span className="font-semibold text-slate-700">{confirmedReg.paymentStatus}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/my-registrations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <span>View My Registrations</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </Link>

          <Link
            to="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-3 px-6 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Back to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-3xl mx-auto">
      {/* Top Section Progress Bar if multiple sections */}
      {sections.length > 1 && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <span className="font-mono font-bold text-slate-700">
              Section {currentSectionIndex + 1} of {sections.length}:
            </span>
            <span className="text-slate-600 truncate max-w-xs">{activeSection.title}</span>
          </div>

          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Section Header */}
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeSection.title}
          </h2>
          {activeSection.description && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {activeSection.description}
            </p>
          )}
        </div>

        {submitError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Dynamic Question Fields */}
        <div className="space-y-5">
          {activeQuestions.map(question => (
            <DynamicFieldRenderer
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(val) => handleFieldChange(question.id, val)}
              error={errors[question.id]}
            />
          ))}
        </div>

        {/* Dedicated Payment Block on Last Section */}
        {showPaymentOnLastSection && (
          <div className="pt-4">
            <PaymentBlockView
              settings={formDefinition.paymentSettings}
              transactionId={transactionId}
              screenshotUrl={screenshotUrl}
              onTransactionIdChange={setTransactionId}
              onScreenshotUrlChange={setScreenshotUrl}
            />
            {errors['payment_tid'] && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors['payment_tid']}</span>
              </p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentSectionIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={isLastSection ? handleSubmit : handleNext}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs sm:text-sm font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <span>
              {submitting ? 'Submitting...' : isLastSection ? 'Submit Registration' : 'Next Section'}
            </span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
