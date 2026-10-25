import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Orbit, Rocket, Telescope, Compass, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-space-darkest/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform duration-300">
              <Orbit className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                COSMICHORIZON
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                Space & Orbit Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navItemClass} end>
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </NavLink>
            <NavLink to="/tracker" className={navItemClass}>
              <Orbit className="w-4 h-4" />
              <span>ISS Live Tracker</span>
            </NavLink>
            <NavLink to="/launches" className={navItemClass}>
              <Rocket className="w-4 h-4" />
              <span>Launches</span>
            </NavLink>
            <NavLink to="/nasa" className={navItemClass}>
              <Telescope className="w-4 h-4" />
              <span>NASA Explorer</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            )}
          </div>

          {/* User Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/40 hover:border-cyan-500/50 transition group"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-400/50"
                  />
                  <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan hover:opacity-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 space-y-1.5 bg-space-dark/95 border-b border-slate-800">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
            end
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </NavLink>
          <NavLink
            to="/tracker"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            <Orbit className="w-4 h-4" />
            <span>ISS Live Tracker</span>
          </NavLink>
          <NavLink
            to="/launches"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            <Rocket className="w-4 h-4" />
            <span>Launches</span>
          </NavLink>
          <NavLink
            to="/nasa"
            onClick={() => setMobileMenuOpen(false)}
            className={navItemClass}
          >
            <Telescope className="w-4 h-4" />
            <span>NASA Explorer</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={navItemClass}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Logged in as <b>{user?.name}</b></span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-200 text-center"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium text-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
