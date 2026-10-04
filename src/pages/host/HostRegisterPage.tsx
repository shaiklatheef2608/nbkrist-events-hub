import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { NBKRISTLogo } from '../../components/common/NBKRISTLogo';
import { NeuralBackground } from '../../components/common/NeuralBackground';
import { useAuth } from '../../context/AuthContext';
import { APPROVED_HOSTS } from '../../utils/constants';

export const HostRegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const normalizedEmail = email.toLowerCase().trim();
  const detectedOrg = APPROVED_HOSTS[normalizedEmail];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict whitelist check
    if (!detectedOrg) {
      setError('This email is not authorized to register as an event host. Please use your officially approved NBKRIST host email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    const res = await register(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/host/dashboard');
    } else {
      setError(res.error || 'Failed to complete host registration.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <NeuralBackground intensity="medium" className="opacity-15" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <NBKRISTLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Register Host Account
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            NBKRIST INSTITUTE OF SCIENCE & TECHNOLOGY
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px]">
              Host Enrollment
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xs border border-blue-200 text-[10px]">
              <Lock className="w-3 h-3" />
              Whitelist Guarded
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Official Host Email */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Official Host Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. csenbkrist@nbkrist.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
                {detectedOrg && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Automatic Organization Resolution Indicator (Section 11) */}
              {detectedOrg ? (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Auto-Assigned Organization: <strong>{detectedOrg}</strong>
                  </span>
                </div>
              ) : email.includes('@') ? (
                <p className="text-[11px] text-amber-700 mt-1">
                  Must be one of the approved NBKRIST host accounts.
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Set Password (Min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-3 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>{loading ? 'Creating Host Account...' : 'Activate Host Account'}</span>
            </button>

          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already registered?</span>
            <Link
              to="/host/login"
              className="font-semibold text-blue-700 hover:text-blue-900 transition-colors inline-flex items-center gap-1"
            >
              <span>Host Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
