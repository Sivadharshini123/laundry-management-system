import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Waves, Calendar, MessageSquare, Shield, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path) => {
    const active = location.pathname === path;
    return `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block">Campus Laundry</span>
              <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider block">Booking & Telemetry</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className={navItemClass('/')}>
                <Waves className="w-4 h-4" />
                <span>Laundries</span>
              </Link>
              <Link to="/transactions" className={navItemClass('/transactions')}>
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
              <Link to="/chat" className={navItemClass('/chat')}>
                <MessageSquare className="w-4 h-4" />
                <span>AI Assistant</span>
              </Link>
              {isStaff && (
                <Link to="/staff" className={navItemClass('/staff')}>
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 font-semibold">Staff Dashboard</span>
                </Link>
              )}
            </nav>
          )}

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-slate-800 leading-none">{user?.name}</span>
                    <span className="block text-[10px] text-slate-500 capitalize">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Waves className="w-4 h-4 text-blue-600" />
            <span>Browse Laundries</span>
          </Link>
          <Link
            to="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>My Bookings & History</span>
          </Link>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>AI Assistant</span>
          </Link>
          {isStaff && (
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Staff Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
