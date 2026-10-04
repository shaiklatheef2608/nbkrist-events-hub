import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HostUnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Host Access Restricted
      </h1>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2 leading-relaxed text-left">
        <p>
          Your authenticated account (<strong className="font-mono text-slate-800">{user?.email}</strong>) is not in the approved NBKRIST host whitelist registry.
        </p>
        <p>
          Only designated collegiate accounts (@nbkrist.org) representing academic departments or recognized student chapters are permitted to publish and manage events.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <button
          onClick={() => logout()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Events</span>
        </Link>
      </div>
    </div>
  );
};
