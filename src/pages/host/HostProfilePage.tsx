import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ShieldCheck, Mail, Lock, Building, Key, Award, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { HOST_METADATA } from '../../utils/constants';

export const HostProfilePage: React.FC = () => {
  const { hostProfile, user } = useAuth();
  const orgName = hostProfile?.organization || 'NBKRIST Host';
  const meta = HOST_METADATA[orgName];

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword) {
      setError('Please specify a new security password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('No active authenticated host session found.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentUser, newPassword);
      setSuccess('Your organizer password has been successfully updated.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('For host security, please sign out and sign back in to change your password.');
      } else {
        setError(err.message || 'Unable to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          Verified academic organizer credentials and security credentials management.
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

      {/* Change Password Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Update Security Password
          </h2>
          <p className="text-xs text-slate-500">
            Change your account password directly inside your host panel.
          </p>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-3 pr-10 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Updating Password...' : 'Save Security Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
