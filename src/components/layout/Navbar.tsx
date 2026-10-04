import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  KeyRound, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut
} from 'lucide-react';
import { NBKRISTLogo } from '../common/NBKRISTLogo';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const { user, hostProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Events', path: '/events' },
    { name: 'Viewed Events', path: '/viewed-events' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname + location.search === path || location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
            <NBKRISTLogo size="md" showText={true} />
          </Link>

          {/* Center Search Input (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search events..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs">
                Ctrl+K
              </kbd>
            </form>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Host Portal */}
          <div className="hidden md:flex items-center gap-3 ml-4">
            {user && hostProfile ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/host/dashboard"
                  className="inline-flex items-center gap-2 bg-[#091e42] hover:bg-[#061530] text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-xs transition-all border border-blue-900"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                  <span>{hostProfile.organization}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/host/login"
                className="inline-flex items-center gap-2 bg-[#091e42] hover:bg-[#071733] text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs hover:shadow-md transition-all border border-blue-900/40"
              >
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>Host Portal</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {user && hostProfile ? (
              <Link
                to="/host/dashboard"
                className="p-1.5 text-blue-800 bg-blue-50 rounded-md text-xs font-semibold"
              >
                Dashboard
              </Link>
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events at NBKRIST..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden"
              />
            </form>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(link.path)
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-200">
              {user && hostProfile ? (
                <div className="space-y-2">
                  <div className="px-3 py-1.5 text-xs text-slate-500 font-mono">
                    Host: <strong className="text-slate-800">{hostProfile.organization}</strong>
                  </div>
                  <Link
                    to="/host/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#091e42] text-white text-sm font-medium py-2.5 rounded-md"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>Host Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-medium py-2 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/host/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#091e42] text-white text-sm font-medium py-2.5 rounded-md shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span>Host Portal Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
