import React, { useState } from 'react';
import { Settings, ShieldCheck, Mail, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HostRegistrationSettingsPage: React.FC = () => {
  const { hostProfile } = useAuth();
  const [defaultMethod, setDefaultMethod] = useState('googleForm');
  const [defaultContactEmail, setDefaultContactEmail] = useState(hostProfile?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
          <span>HOST OPERATIONS</span>
          <span>/</span>
          <span>REGISTRATION CONFIGURATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Registration Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default registration routing workflows for <strong>{hostProfile?.organization}</strong>.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Default registration preferences updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-800">
            Preferred Default Registration Method
          </label>
          <p className="text-xs text-slate-500">
            Pre-selected when creating new symposiums or student activity events.
          </p>
          <select
            value={defaultMethod}
            onChange={(e) => setDefaultMethod(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 mt-1 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="googleForm">Google Form (Recommended for NBKRIST Chapters)</option>
            <option value="externalWebsite">External Website</option>
            <option value="microsoftForm">Microsoft Form</option>
            <option value="email">Direct Email Application</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-800">
            Default Inquiries & Coordinator Email
          </label>
          <p className="text-xs text-slate-500">
            Official contact listed for student queries regarding schedule and eligibility.
          </p>
          <input
            type="email"
            value={defaultContactEmail}
            onChange={(e) => setDefaultContactEmail(e.target.value)}
            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-900 mt-1 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="p-4 bg-sky-50 border border-sky-200/80 rounded-lg text-xs text-sky-950 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            <span>Collegiate Policy on Registrations</span>
          </div>
          <p className="leading-relaxed">
            Per NBKRIST academic governance, student delegate data collected via external Google Forms or Microsoft Forms must adhere to student privacy standards. No registration fee payments should bypass institutional accounts.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-5 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
};
