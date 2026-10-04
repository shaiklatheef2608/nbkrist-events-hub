import React from 'react';
import { Link } from 'react-router-dom';
import { NBKRISTLogo } from '../common/NBKRISTLogo';
import { ShieldCheck, Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050c1a] text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Institutional Identification */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <NBKRISTLogo size="lg" showText={false} />
              <div>
                <h3 className="text-white text-lg font-bold tracking-tight">NBKRIST Events Hub</h3>
                <p className="text-xs text-sky-400 font-mono tracking-wider">
                  N.B.K.R. INSTITUTE OF SCIENCE & TECHNOLOGY
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The central institutional platform for academic symposia, IEEE research summits, hackathons, and departmental activities at N.B.K.R. Institute of Science & Technology.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>AUTONOMOUS INSTITUTION • AFFILIATED TO JNTUA • APPROVED BY AICTE</span>
            </div>
          </div>

          {/* Academic & Research Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">
              Academic & Research Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  NAAC & NBA Accreditation
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Research & Development Cell
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  IEEE Student Branch NBKRIST
                </span>
              </li>
              <li>
                <Link to="/host/login" className="text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1">
                  Host Guidelines & Portal <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-default">
                  Privacy Policy & Event Governance
                </span>
              </li>
            </ul>
          </div>

          {/* Campus Desk */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">
              Campus Desk
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">NBKRIST Campus</p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Vidyanagar, Kota Mandal, Tirupati District - 524413, Andhra Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="mailto:events@nbkrist.org" className="text-sky-400 hover:underline">
                  events@nbkrist.org
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div>
            © 2025 NBKR Institute of Science & Technology (Autonomous), Vidyanagar. All Rights Reserved. Accredited by NAAC with 'A' Grade & NBA.
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">PORTAL VER: 2.4.0</span>
            <span>•</span>
            <span className="text-slate-400">ISO 9001:2015 CERTIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
