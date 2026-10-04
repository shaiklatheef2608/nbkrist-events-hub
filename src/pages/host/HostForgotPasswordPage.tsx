import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { NBKRISTLogo } from '../../components/common/NBKRISTLogo';
import { NeuralBackground } from '../../components/common/NeuralBackground';

export const HostForgotPasswordPage: React.FC = () => {
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-slate-800 text-base">Contact Domain Administrator</h3>
          
          <p className="text-xs text-slate-600 leading-relaxed">
            For security reasons, direct self-service password resets have been restricted. If you have forgotten your password or need a password reset, you must contact your institutional domain administrator:
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 select-all flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-700" />
            <span>abdullatheefshaik4o@gmail.com</span>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Please include your authorized organization name and department details in the request.
          </p>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/host/login"
              className="text-xs text-blue-700 hover:text-blue-900 hover:underline transition-colors inline-flex items-center gap-1.5 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Host Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
