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
  const { register, loginWithGoogle } = useAuth();
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success) {
      navigate('/host/dashboard');
    } else {
      setError(res.error || 'Google sign-in failed.');
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

          {/* Google Sign In option */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-mono text-[10px]">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 border border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>

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
