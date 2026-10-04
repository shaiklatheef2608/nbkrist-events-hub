import React from 'react';
import { ExternalLink, Mail, CheckCircle2, Lock } from 'lucide-react';
import { NBKRISTEvent } from '../../types';

interface RegisterButtonProps {
  event: NBKRISTEvent;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RegisterButton: React.FC<RegisterButtonProps> = ({ 
  event, 
  className = '', 
  size = 'md' 
}) => {
  const isRegistrationClosed = event.status === 'registration_closed' || event.status === 'completed';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRegistrationClosed) return;

    if (event.registrationMethod === 'email') {
      const subject = encodeURIComponent(`Registration Request: ${event.title}`);
      const body = encodeURIComponent(
        `Dear Event Coordinators,\n\nI would like to register for "${event.title}".\n\nStudent Name:\nRoll Number / USN:\nBranch / Department:\nCollege / Institution:\nPhone Number:\n\nThank you.`
      );
      const recipient = event.registrationEmail || 'events@nbkrist.org';
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    } else {
      const targetUrl = event.registrationUrl || '#';
      if (targetUrl && targetUrl !== '#') {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs font-semibold',
    lg: 'px-6 py-3 text-sm font-semibold'
  }[size];

  if (isRegistrationClosed) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed ${sizeClasses} ${className}`}
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Registration Closed</span>
      </button>
    );
  }

  const getButtonLabel = () => {
    switch (event.registrationMethod) {
      case 'googleForm':
        return 'Register via Google Form';
      case 'microsoftForm':
        return 'Register via MS Form';
      case 'email':
        return 'Register via Email';
      case 'externalWebsite':
      default:
        return 'Register Now';
    }
  };

  const getIcon = () => {
    if (event.registrationMethod === 'email') {
      return <Mail className="w-3.5 h-3.5" />;
    }
    return <ExternalLink className="w-3.5 h-3.5" />;
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md bg-[#091e42] hover:bg-[#071733] text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98] ${sizeClasses} ${className}`}
    >
      <span>{getButtonLabel()}</span>
      {getIcon()}
    </button>
  );
};
