import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  KeyRound, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { APPROVED_HOSTS, HOST_METADATA } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export const WhitelistSecuritySection: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, hostProfile } = useAuth();
  const navigate = useNavigate();

  const detectedOrg = APPROVED_HOSTS[emailInput.toLowerCase().trim()];

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim() || !passwordInput) {
      setErrorMsg('Please enter both your official host email and password.');
      return;
    }

    if (!detectedOrg) {
      setErrorMsg('This email is not authorized to register or login as an event host. Please use your officially approved NBKRIST host email.');
      return;
    }

    setSubmitting(true);
    const res = await login(emailInput, passwordInput);
    setSubmitting(false);

    if (res.success) {
      navigate('/host/dashboard');
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Institutional Host Portal & Strict Whitelist Security
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Only designated collegiate emails with valid <span className="font-mono text-slate-700">@nbkrist.org</span> domain credentials can publish or edit events.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-mono font-semibold px-3 py-1.5 rounded-md border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Firebase Auth + Firestore Security Rules Enforced</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* Whitelist Registry Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Approved Organizer Whitelist Registry
            </h3>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xs border border-blue-100">
              10 Verified Endpoints
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(APPROVED_HOSTS).map(([email, org]) => {
              const meta = HOST_METADATA[org];
              const shortOrg = meta?.code ? meta.code.replace('NBKR-', '') + ' ' + (meta.type === 'Department' ? 'DEPT' : 'BRANCH') : org;

              return (
                <div 
                  key={email}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/90 rounded-md transition-all flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[11px] text-slate-800 font-semibold block truncate">
                      {email}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {org}
                    </span>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono font-semibold text-blue-700 bg-white border border-blue-200 px-1.5 py-0.5 rounded-xs">
                    {shortOrg}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Auto mapping notice */}
          <div className="bg-sky-50/70 border border-sky-200/70 rounded-md p-3 flex items-start gap-2 text-xs text-sky-900">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong>Auto-Organization Mapping:</strong> When authenticated, the session state dynamically locks all new submissions to the authorized department identifier.
            </div>
          </div>
        </div>

        {/* Quick Login / Organizer Card */}
        <div className="lg:col-span-5 bg-slate-50 rounded-lg border border-slate-200/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Department Organizer Login
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                SSL / SHA-256
              </span>
            </div>

            {user && hostProfile ? (
              <div className="py-6 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800">
                  <p className="font-semibold">Signed in as {hostProfile.organization}</p>
                  <p className="font-mono text-[11px] text-emerald-700 mt-0.5">{hostProfile.email}</p>
                </div>

                <Link
                  to="/host/dashboard"
                  className="w-full flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-2.5 rounded-md shadow-xs transition-colors"
                >
                  <span>Go to Host Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleQuickLogin} className="space-y-3.5 mt-4">
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-600 mb-1">
                    Official NBKRIST Host Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. csenbkrist@nbkrist.org"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md py-2 px-2.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                    {detectedOrg && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {detectedOrg && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      ✓ Auto-mapped to: {detectedOrg}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-slate-600">
                      Account Password
                    </label>
                    <Link to="/host/forgot-password" className="text-[11px] text-blue-700 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md py-2 px-2.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold py-2.5 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                  <span>{submitting ? 'Authenticating...' : 'Sign In to Host Dashboard'}</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-500">
            <span>Don't have host credentials activated yet? </span>
            <Link to="/host/register" className="text-blue-700 font-semibold hover:underline">
              Register Host Account
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
