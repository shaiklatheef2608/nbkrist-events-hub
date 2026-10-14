import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Save, 
  Send, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  GitBranch, 
  QrCode, 
  Settings2,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getEventById, 
  getRegistrationForm, 
  saveRegistrationForm, 
  getDefaultRegistrationForm 
} from '../../lib/firestore';
import { 
  NBKRISTEvent, 
  RegistrationFormDefinition, 
  FormSection, 
  FormQuestion, 
  RegistrationQuestionType, 
  LogicRule,
  PaymentSettings
} from '../../types';
import { PageLoadingState } from '../../components/common/LoadingState';
import { ParticipantRegistrationForm } from '../../components/registration/ParticipantRegistrationForm';
import { formatDisplayImageUrl } from '../../utils/driveUrlHelper';

const QUESTION_TYPES: { type: RegistrationQuestionType; label: string }[] = [
  { type: 'shortAnswer', label: 'Short answer' },
  { type: 'longAnswer', label: 'Long answer' },
  { type: 'email', label: 'Email address' },
  { type: 'phone', label: 'Phone number' },
  { type: 'number', label: 'Number' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'multipleChoice', label: 'Multiple choice' },
  { type: 'checkboxes', label: 'Checkboxes' },
  { type: 'yesNo', label: 'Yes / No' },
  { type: 'date', label: 'Date' },
  { type: 'time', label: 'Time' },
  { type: 'dateTime', label: 'Date and time' },
  { type: 'rating', label: 'Rating (1 to 5)' },
  { type: 'agreement', label: 'Agreement checkbox' },
  { type: 'image', label: 'Image / Notice block' },
  { type: 'transactionId', label: 'Transaction UTR ID' },
  { type: 'paymentScreenshot', label: 'Payment screenshot URL' }
];

export const HostFormBuilderPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, hostProfile } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<NBKRISTEvent | null>(null);
  const [form, setForm] = useState<RegistrationFormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Tab: 'builder' | 'preview' | 'logic' | 'settings'
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'logic' | 'settings'>('builder');

  // Currently active section in builder
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  useEffect(() => {
    async function init() {
      if (!eventId || !user) return;
      try {
        const ev = await getEventById(eventId);
        if (!ev) {
          setSaveError('Event document not found in Firestore.');
          setLoading(false);
          return;
        }
        setEvent(ev);

        const existingForm = await getRegistrationForm(eventId);
        if (existingForm) {
          setForm(existingForm);
          setActiveSectionId(existingForm.sections[0]?.id || 'section-1');
        } else {
          const defaultDef = getDefaultRegistrationForm(eventId, ev.title, user.uid);
          setForm(defaultDef);
          setActiveSectionId(defaultDef.sections[0]?.id || 'section-personal');
        }
      } catch (err: any) {
        console.error("Form load error:", err);
        setSaveError(err.message || 'Error loading registration form configuration.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [eventId, user]);

  if (loading || !form || !event) {
    return <PageLoadingState message="Loading Registration Form Designer..." />;
  }

  // --- QUESTION ACTIONS ---
  const handleAddQuestion = (type: RegistrationQuestionType = 'shortAnswer') => {
    const newId = `q_${Date.now()}`;
    const newQuestion: FormQuestion = {
      id: newId,
      type,
      label: type === 'image' ? 'Notice Image' : 'Untitled Question',
      required: type !== 'image',
      sectionId: activeSectionId,
      displayOrder: form.questions.filter(q => q.sectionId === activeSectionId).length + 1,
      options: ['multipleChoice', 'checkboxes', 'dropdown'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      altText: type === 'image' ? 'Event announcement' : undefined
    };

    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...prev.questions, newQuestion]
      };
    });
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<FormQuestion>) => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
      };
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.filter(q => q.id !== qId),
        logicRules: prev.logicRules.filter(r => r.targetId !== qId && !r.conditions.some(c => c.fieldId === qId))
      };
    });
  };

  const handleDuplicateQuestion = (qId: string) => {
    const target = form.questions.find(q => q.id === qId);
    if (!target) return;

    const copyId = `q_${Date.now()}`;
    const duplicated: FormQuestion = {
      ...target,
      id: copyId,
      label: `${target.label} (Copy)`,
      displayOrder: target.displayOrder + 1
    };

    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...prev.questions, duplicated]
      };
    });
  };

  const handleMoveQuestion = (qId: string, direction: 'up' | 'down') => {
    const secQuestions = form.questions
      .filter(q => q.sectionId === activeSectionId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const index = secQuestions.findIndex(q => q.id === qId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= secQuestions.length) return;

    const currentQ = secQuestions[index];
    const swapQ = secQuestions[targetIndex];

    const updatedOrder = form.questions.map(q => {
      if (q.id === currentQ.id) return { ...q, displayOrder: swapQ.displayOrder };
      if (q.id === swapQ.id) return { ...q, displayOrder: currentQ.displayOrder };
      return q;
    });

    setForm(prev => prev ? { ...prev, questions: updatedOrder } : prev);
  };

  // --- SECTION ACTIONS ---
  const handleAddSection = () => {
    const secId = `section_${Date.now()}`;
    const newSection: FormSection = {
      id: secId,
      title: `Section ${form.sections.length + 1}`,
      description: '',
      displayOrder: form.sections.length + 1
    };

    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newSection]
      };
    });
    setActiveSectionId(secId);
  };

  const handleUpdateSection = (secId: string, updates: Partial<FormSection>) => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map(s => s.id === secId ? { ...s, ...updates } : s)
      };
    });
  };

  const handleDeleteSection = (secId: string) => {
    if (form.sections.length <= 1) {
      alert("A registration form must have at least one section.");
      return;
    }

    setForm(prev => {
      if (!prev) return prev;
      const remainingSections = prev.sections.filter(s => s.id !== secId);
      const fallbackId = remainingSections[0]?.id;
      // Re-assign orphaned questions to the first section
      const reassignedQuestions = prev.questions.map(q => q.sectionId === secId ? { ...q, sectionId: fallbackId } : q);
      return {
        ...prev,
        sections: remainingSections,
        questions: reassignedQuestions
      };
    });
    const fallbackSec = form.sections.find(s => s.id !== secId);
    if (fallbackSec) setActiveSectionId(fallbackSec.id);
  };

  // --- SAVE & PUBLISH ---
  const handleSave = async (publish: boolean) => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const saved = await saveRegistrationForm(event.eventId, form, user.uid, publish);
      setForm(saved);
      setSaveSuccess(
        publish
          ? `Registration Form Published! Version ${saved.version} is now live for participants.`
          : 'Form draft saved successfully.'
      );
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message || 'Failed to save form definition.');
    } finally {
      setSaving(false);
    }
  };

  const currentQuestions = form.questions
    .filter(q => q.sectionId === activeSectionId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeSection = form.sections.find(s => s.id === activeSectionId) || form.sections[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/host/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Events</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Registration Form Builder
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 font-semibold">
              v{form.version} ({form.status.toUpperCase()})
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-xl mt-0.5">
            Event: <strong className="text-slate-700">{event.title}</strong>
          </p>
        </div>

        {/* Action Buttons: Save Draft & Publish */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Publish Form</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Mode Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white rounded-t-xl px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'builder'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Form Designer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logic')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logic'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branching Rules ({form.logicRules?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Payment & Limits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-700" />
            <span>Live Participant Preview</span>
          </button>
        </div>
      </div>

      {/* 27. LIVE PARTICIPANT PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-700" />
              <span><strong>Interactive Participant Preview</strong>: Branching rules, required checks, and payment blocks behave exactly as they will for students.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className="font-semibold text-blue-800 hover:underline cursor-pointer"
            >
              Exit Preview
            </button>
          </div>

          <ParticipantRegistrationForm
            event={event}
            formDefinition={form}
            user={user ? { uid: user.uid, email: user.email } : { uid: 'preview_host', email: 'host@nbkrist.org' }}
          />
        </div>
      )}

      {/* LOGIC BRANCHING TAB */}
      {activeTab === 'logic' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-700" />
                <span>Conditional Branching Rules</span>
              </h2>
              <p className="text-xs text-slate-500">
                Show or hide questions, skip sections, or route students based on previous answers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newRule: LogicRule = {
                  id: `rule_${Date.now()}`,
                  combinator: 'AND',
                  conditions: [
                    {
                      fieldId: form.questions[0]?.id || '',
                      operator: 'equals',
                      value: 'Yes'
                    }
                  ],
                  action: 'showQuestion',
                  targetId: form.questions[1]?.id || ''
                };
                setForm(prev => prev ? { ...prev, logicRules: [...(prev.logicRules || []), newRule] } : prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Logic Rule</span>
            </button>
          </div>

          {(form.logicRules || []).length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 space-y-2">
              <GitBranch className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">No Branching Rules Configured</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All questions will be displayed sequentially. Click "Add Logic Rule" to create dynamic conditional paths.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.logicRules.map((rule, rIdx) => (
                <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Rule #{rIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => prev ? {
                          ...prev,
                          logicRules: prev.logicRules.filter(r => r.id !== rule.id)
                        } : prev);
                      }}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                    <span className="font-mono text-slate-500 font-bold sm:col-span-1">IF</span>

                    <select
                      value={rule.conditions[0]?.fieldId}
                      onChange={(e) => {
                        const newConditions = [{ ...rule.conditions[0], fieldId: e.target.value }];
                        setForm(prev => prev ? {
                          ...prev,
                          logicRules: prev.logicRules.map(r => r.id === rule.id ? { ...r, conditions: newConditions } : r)
                        } : prev);
                      }}
                      className="sm:col-span-4 bg-white border border-slate-300 rounded p-2 text-slate-800"
                    >
                      {form.questions.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.label.slice(0, 30)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.conditions[0]?.operator}
                      onChange={(e) => {
                        const newConditions = [{ ...rule.conditions[0], operator: e.target.value as any }];
                        setForm(prev => prev ? {
                          ...prev,
                          logicRules: prev.logicRules.map(r => r.id === rule.id ? { ...r, conditions: newConditions } : r)
                        } : prev);
                      }}
                      className="sm:col-span-3 bg-white border border-slate-300 rounded p-2 text-slate-800"
                    >
                      <option value="equals">equals</option>
                      <option value="notEquals">not equals</option>
                      <option value="contains">contains</option>
                      <option value="greaterThan">greater than</option>
                      <option value="lessThan">less than</option>
                      <option value="isAnswered">is answered</option>
                      <option value="isNotAnswered">is not answered</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Value (e.g. Yes)"
                      value={rule.conditions[0]?.value ?? ''}
                      onChange={(e) => {
                        const newConditions = [{ ...rule.conditions[0], value: e.target.value }];
                        setForm(prev => prev ? {
                          ...prev,
                          logicRules: prev.logicRules.map(r => r.id === rule.id ? { ...r, conditions: newConditions } : r)
                        } : prev);
                      }}
                      className="sm:col-span-4 bg-white border border-slate-300 rounded p-2 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs pt-1 border-t border-slate-200">
                    <span className="font-mono text-blue-700 font-bold sm:col-span-1">THEN</span>

                    <select
                      value={rule.action}
                      onChange={(e) => {
                        setForm(prev => prev ? {
                          ...prev,
                          logicRules: prev.logicRules.map(r => r.id === rule.id ? { ...r, action: e.target.value as any } : r)
                        } : prev);
                      }}
                      className="sm:col-span-5 bg-white border border-slate-300 rounded p-2 text-slate-800"
                    >
                      <option value="showQuestion">Show question</option>
                      <option value="hideQuestion">Hide question</option>
                      <option value="goToSection">Go to section</option>
                      <option value="skipSection">Skip section</option>
                      <option value="endRegistration">End registration</option>
                    </select>

                    {rule.action !== 'endRegistration' && (
                      <select
                        value={rule.targetId}
                        onChange={(e) => {
                          setForm(prev => prev ? {
                            ...prev,
                            logicRules: prev.logicRules.map(r => r.id === rule.id ? { ...r, targetId: e.target.value } : r)
                          } : prev);
                        }}
                        className="sm:col-span-6 bg-white border border-slate-300 rounded p-2 text-slate-800"
                      >
                        {rule.action.includes('Section') ? (
                          form.sections.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))
                        ) : (
                          form.questions.map(q => (
                            <option key={q.id} value={q.id}>
                              {q.label.slice(0, 30)}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM SETTINGS & PAYMENT CONFIG TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Payment Block Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Institutional Payment Block
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enable UPI payment for delegate fees, scan QR codes, and collect UTR transaction IDs.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paymentSettings?.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setForm(prev => prev ? {
                      ...prev,
                      paymentSettings: {
                        ...prev.paymentSettings,
                        enabled
                      }
                    } : prev);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {form.paymentSettings?.enabled && (
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Fee Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={form.paymentSettings.amount}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setForm(prev => prev ? {
                            ...prev,
                            paymentSettings: { ...prev.paymentSettings, amount }
                          } : prev);
                        }}
                        className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Currency Symbol / Code
                    </label>
                    <input
                      type="text"
                      value={form.paymentSettings.currency || '₹'}
                      onChange={(e) => {
                        const currency = e.target.value;
                        setForm(prev => prev ? {
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, currency }
                        } : prev);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. nbkrist@upi"
                      value={form.paymentSettings.upiId}
                      onChange={(e) => {
                        const upiId = e.target.value;
                        setForm(prev => prev ? {
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, upiId }
                        } : prev);
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment QR Code Image URL (Public URL or Google Drive sharing link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://i.postimg.cc/... or https://drive.google.com/file/d/..."
                    value={form.paymentSettings.qrImageUrl || ''}
                    onChange={(e) => {
                      const qrImageUrl = e.target.value;
                      setForm(prev => prev ? {
                        ...prev,
                        paymentSettings: { ...prev.paymentSettings, qrImageUrl }
                      } : prev);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Upload your QR image on <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">postimages.org</a> or paste a public Google Drive sharing URL.
                  </p>

                  {/* QR Preview in Builder */}
                  {form.paymentSettings.qrImageUrl && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-xs text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">QR Code Preview</span>
                      <div className="w-36 h-36 mx-auto rounded overflow-hidden border border-slate-200 bg-white p-1">
                        <img
                          src={formatDisplayImageUrl(form.paymentSettings.qrImageUrl)}
                          alt="QR Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Instructions for Students
                  </label>
                  <textarea
                    rows={2}
                    value={form.paymentSettings.instructions || ''}
                    onChange={(e) => {
                      const instructions = e.target.value;
                      setForm(prev => prev ? {
                        ...prev,
                        paymentSettings: { ...prev.paymentSettings, instructions }
                      } : prev);
                    }}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.paymentSettings.transactionIdRequired}
                      onChange={(e) => {
                        const transactionIdRequired = e.target.checked;
                        setForm(prev => prev ? {
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, transactionIdRequired }
                        } : prev);
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Transaction UTR ID Required</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.paymentSettings.paymentScreenshotRequired}
                      onChange={(e) => {
                        const paymentScreenshotRequired = e.target.checked;
                        setForm(prev => prev ? {
                          ...prev,
                          paymentSettings: { ...prev.paymentSettings, paymentScreenshotRequired }
                        } : prev);
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Payment Screenshot URL Required</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Registration Rules & Limits */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Registration Restrictions & Capacity
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={!form.allowDuplicateRegistration}
                  onChange={(e) => {
                    const allowDuplicate = !e.target.checked;
                    setForm(prev => prev ? {
                      ...prev,
                      allowDuplicateRegistration: allowDuplicate
                    } : prev);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">One registration per participant (enforce single registration by authenticated UID)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Participant Capacity Limit (Max seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 200"
                    value={form.capacityLimit || ''}
                    onChange={(e) => {
                      const capacityLimit = parseInt(e.target.value, 10) || undefined;
                      setForm(prev => prev ? { ...prev, capacityLimit } : prev);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Displays "Registration Full" once reached.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration Cutoff Deadline
                  </label>
                  <input
                    type="date"
                    value={form.registrationDeadline || ''}
                    onChange={(e) => {
                      const registrationDeadline = e.target.value;
                      setForm(prev => prev ? { ...prev, registrationDeadline } : prev);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automatically closes registration past this date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM DESIGNER BUILDER TAB */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          
          {/* Section Selection Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>Form Sections ({form.sections.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeSectionId === sec.id
                      ? 'bg-[#091e42] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{idx + 1}. {sec.title || 'Untitled Section'}</span>
                </button>
              ))}
            </div>

            {/* Edit active section metadata */}
            {activeSection && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Section Title</label>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => handleUpdateSection(activeSection.id, { title: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-900"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">Section Description</label>
                  <input
                    type="text"
                    placeholder="Optional guidance for this section"
                    value={activeSection.description || ''}
                    onChange={(e) => handleUpdateSection(activeSection.id, { description: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-700"
                  />
                </div>
                <div className="sm:col-span-1 text-right pt-4 sm:pt-0">
                  {form.sections.length > 1 && (
                    <button
                      type="button"
                      title="Delete Section"
                      onClick={() => handleDeleteSection(activeSection.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Questions Container in Active Section */}
          <div className="space-y-4">
            {currentQuestions.map((question, qIdx) => (
              <div 
                key={question.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 p-5 space-y-4 transition-all"
              >
                {/* Question Top Row: Label, Type Selector & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Question #{qIdx + 1}</span>
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => handleUpdateQuestion(question.id, { label: e.target.value })}
                      placeholder="Type question or prompt..."
                      className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-hidden py-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={question.type}
                      onChange={(e) => handleUpdateQuestion(question.id, { 
                        type: e.target.value as RegistrationQuestionType,
                        options: ['multipleChoice', 'checkboxes', 'dropdown'].includes(e.target.value) && !question.options
                          ? ['Option 1', 'Option 2']
                          : question.options
                      })}
                      className="bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 py-1.5 px-2.5 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(question.id, 'up')}
                      disabled={qIdx === 0}
                      title="Move Up"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(question.id, 'down')}
                      disabled={qIdx === currentQuestions.length - 1}
                      title="Move Down"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle / Description input */}
                <div>
                  <input
                    type="text"
                    value={question.description || ''}
                    onChange={(e) => handleUpdateQuestion(question.id, { description: e.target.value })}
                    placeholder="Help text or instructions for the student (optional)"
                    className="w-full text-xs text-slate-500 bg-transparent border-b border-dashed border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-hidden py-0.5"
                  />
                </div>

                {/* Question Type Specific Configuration */}
                {/* Image Block Config */}
                {question.type === 'image' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <label className="block text-[11px] font-mono text-slate-600 uppercase">Image / Banner URL (Supports direct web URLs or Google Drive sharing link)</label>
                    <input
                      type="url"
                      placeholder="https://i.postimg.cc/... or public Google Drive link"
                      value={question.imageUrl || ''}
                      onChange={(e) => handleUpdateQuestion(question.id, { imageUrl: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-200 rounded p-2 text-slate-800"
                    />
                    {question.imageUrl && (
                      <div className="max-w-xs max-h-48 rounded overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={formatDisplayImageUrl(question.imageUrl)}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Choice Options Editor (Radio, Checkbox, Dropdown) */}
                {['multipleChoice', 'checkboxes', 'dropdown'].includes(question.type) && (
                  <div className="space-y-2 pt-1 pl-2 border-l-2 border-blue-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Configured Options</span>
                    {(question.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono w-4">{optIdx + 1}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(question.options || [])];
                            newOpts[optIdx] = e.target.value;
                            handleUpdateQuestion(question.id, { options: newOpts });
                          }}
                          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:bg-white"
                        />
                        {(question.options || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = (question.options || []).filter((_, i) => i !== optIdx);
                              handleUpdateQuestion(question.id, { options: newOpts });
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                        handleUpdateQuestion(question.id, { options: newOpts });
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}

                {/* Question Bottom Card Bar: Required toggle, duplicate, delete */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleUpdateQuestion(question.id, { required: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">Required field</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(question.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Quick Add Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">Add to {activeSection.title}:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('shortAnswer')}
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Question</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('image')}
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Image Block</span>
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
export default HostFormBuilderPage;
