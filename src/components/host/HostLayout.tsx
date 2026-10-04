import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NBKRISTLogo } from '../common/NBKRISTLogo';
import { useAuth } from '../../context/AuthContext';
import { NeuralBackground } from '../common/NeuralBackground';

export const HostLayout: React.FC = () => {
  const { hostProfile, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/host/login');
  };

  const navItems = [
    { label: 'Overview', path: '/host/dashboard', icon: LayoutDashboard },
    { label: 'My Events', path: '/host/events', icon: Calendar },
    { label: 'Create Event', path: '/host/events/create', icon: PlusCircle },
    { label: 'Drafts', path: '/host/events?filter=draft', icon: FileText },
    { label: 'Published Events', path: '/host/events?filter=published', icon: CheckCircle },
    { label: 'Registration Settings', path: '/host/registration-settings', icon: Settings },
    { label: 'Profile', path: '/host/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Top Host Header */}
      <header className="bg-[#071638] text-white border-b border-blue-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-md hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/host/dashboard" className="flex items-center gap-3">
              <NBKRISTLogo size="sm" showText={false} />
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight block">
                  NBKRIST Host Portal
                </span>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                  Autonomous Management Console
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white transition-colors"
            >
              <span>Public Directory</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {hostProfile?.organization || 'Verified Host'}
                </span>
                <span className="text-[10px] font-mono text-sky-400">
                  {hostProfile?.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sticky top-24 space-y-6">
            
            {/* Host Welcome Card */}
            <div className="p-3 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-lg relative overflow-hidden">
              <NeuralBackground intensity="subtle" className="opacity-20" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider block">
                  AUTHENTICATED HOST
                </span>
                <h4 className="font-extrabold text-sm leading-snug">
                  {hostProfile?.organization}
                </h4>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Organizer</span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/host/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-semibold border-l-3 border-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Mobile Sidebar Modal/Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-sm">Host Menu</span>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-blue-900 text-white rounded-lg">
                  <span className="text-[10px] font-mono text-sky-300 block">AUTHENTICATED HOST</span>
                  <p className="font-bold text-xs mt-1">{hostProfile?.organization}</p>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/host/dashboard'}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-md ${
                            isActive
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
