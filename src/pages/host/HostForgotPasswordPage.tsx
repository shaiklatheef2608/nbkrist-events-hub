import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NBKRISTLogo } from '../../components/common/NBKRISTLogo';
import { NeuralBackground } from '../../components/common/NeuralBackground';
import { useAuth } from '../../context/AuthContext';

export const HostForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your approved host email address.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <NeuralBackground intensity="medium" className="opacity-15" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <NBKRISTLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Host Password
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            NBKRIST INSTITUTE OF SCIENCE & TECHNOLOGY
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Reset Instructions Sent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If the email <strong className="font-mono text-slate-800">{email}</strong> matches an authorized host account, a password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link
                  to="/host/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Host Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your designated <code className="font-mono text-slate-700">@nbkrist.org</code> host account email. Firebase will send a secure password reset link.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                    Official Host Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. csenbkrist@nbkrist.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-3 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>{loading ? 'Sending Request...' : 'Send Password Reset Link'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <Link
                  to="/host/login"
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Host Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
