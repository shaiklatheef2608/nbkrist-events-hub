import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, AlertCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { NBKRISTLogo } from '../../components/common/NBKRISTLogo';
import { NeuralBackground } from '../../components/common/NeuralBackground';
import { useAuth } from '../../context/AuthContext';
import { APPROVED_HOSTS } from '../../utils/constants';

export const HostLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const detectedOrg = APPROVED_HOSTS[email.toLowerCase().trim()];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your official host email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/host/dashboard');
    } else {
      setError(res.error || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background neural design */}
      <NeuralBackground intensity="medium" className="opacity-15" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <NBKRISTLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Host Portal Authentication
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            NBKRIST INSTITUTE OF SCIENCE & TECHNOLOGY
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px]">
              Host Gateway
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 text-[10px]">
              <ShieldCheck className="w-3 h-3" />
              Domain Whitelist Verified
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Official NBKRIST Host Email
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
              {detectedOrg && (
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ✓ Identified Organization: {detectedOrg}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase text-slate-600">
                  Password
                </label>
                <Link
                  to="/host/forgot-password"
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-3 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>{loading ? 'Authenticating Host...' : 'Sign In to Host Dashboard'}</span>
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need host credentials?</span>
            <Link
              to="/host/register"
              className="font-semibold text-blue-700 hover:text-blue-900 transition-colors inline-flex items-center gap-1"
            >
              <span>Register as Host</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] font-mono text-slate-500">
          Access restricted to approved @nbkrist.org collegiate department organizers.
        </p>

      </div>
    </div>
  );
};
