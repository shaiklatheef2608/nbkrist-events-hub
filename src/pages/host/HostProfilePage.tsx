import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Building, Key, Clock, Award } from 'lucide-react';
import { HOST_METADATA } from '../../utils/constants';

export const HostProfilePage: React.FC = () => {
  const { hostProfile, user } = useAuth();
  const orgName = hostProfile?.organization || 'NBKRIST Host';
  const meta = HOST_METADATA[orgName];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 uppercase tracking-wider mb-1">
          <span>HOST OPERATIONS</span>
          <span>/</span>
          <span>SECURITY & PROFILE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Host Profile & Identity
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified academic organizer credentials and security rules enforcement status.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Verification banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider">
              AUTHORITATIVE HOST REGISTRY
            </span>
            <h2 className="text-xl font-black">{orgName}</h2>
            <p className="text-xs text-sky-200 font-mono">{hostProfile?.email}</p>
          </div>

          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-700" />
                <span>Assigned Organization (Non-Editable)</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                Organization: {orgName}
              </p>
              <span className="text-[10px] font-mono text-emerald-600 block">
                ✓ Institutional Whitelist Verified
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-700" />
                <span>Official Host Email</span>
              </span>
              <p className="text-sm font-bold font-mono text-slate-900">
                {hostProfile?.email}
              </p>
              <span className="text-[10px] font-mono text-slate-500 block">
                @nbkrist.org collegiate domain
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-700" />
                <span>Department / Entity Classification</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                {meta?.department || 'Academic Department'}
              </p>
              <span className="text-[10px] font-mono text-slate-500 block">
                Code: {meta?.code || 'NBKR'} • {meta?.type || 'Department'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-700" />
                <span>Host Account ID</span>
              </span>
              <p className="text-xs font-mono text-slate-700 truncate">
                {user?.uid}
              </p>
              <span className="text-[10px] font-mono text-emerald-600 block">
                Auth Status: Active
              </span>
            </div>

          </div>

          {/* Security notice */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Identity Protection</span>
            </div>
            <p className="leading-relaxed">
              In accordance with institutional guidelines, the organization assignment is strictly read-only and immutably tied to the official email whitelist. Modifying the host organization is restricted.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
