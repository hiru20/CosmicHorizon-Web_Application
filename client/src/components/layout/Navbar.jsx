import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpRight, LogOut } from 'lucide-react';
import UtcClock from '../common/UtcClock';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100';

// Numbered index. 04 deep-links the Asteroid tab inside /nasa.
const NAV_ITEMS = [
  { index: '01', label: 'ISS', to: '/tracker', match: (p, h) => p === '/tracker' },
  { index: '02', label: 'Gallery', to: '/nasa', match: (p, h) => p === '/nasa' && h !== '#neo' },
  { index: '03', label: 'Launches', to: '/launches', match: (p) => p === '/launches' },
  { index: '04', label: 'Asteroids', to: '/nasa#neo', match: (p, h) => p === '/nasa' && h === '#neo' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (item) => item.match(location.pathname, location.hash);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-ink/90 backdrop-blur-sm border-b border-line">
        <nav className="max-w-shell mx-auto h-14 px-4 sm:px-6 lg:px-10 flex items-center gap-6" aria-label="Main navigation">
          {/* Wordmark */}
          <Link to="/" className="flex items-baseline gap-2 flex-shrink-0 mr-auto lg:mr-0" aria-label="CosmicHorizon home">
            <span className="font-display text-[1.6rem] leading-none text-fg tracking-tight">CosmicHorizon</span>
            <span className="hidden sm:inline font-mono text-[0.5625rem] text-fg-faint tracking-label">CH-25544</span>
          </Link>

          {/* Numbered index (desktop) */}
          <ul className="hidden lg:flex items-center h-full ml-10 mr-auto">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.index} className="h-full">
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative h-full flex items-center gap-2 px-4 font-mono text-[0.6875rem] uppercase tracking-label transition-colors ${
                      active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    <span className={active ? 'text-signal' : 'text-fg-faint group-hover:text-fg-muted'}>{item.index}</span>
                    <span>{item.label}</span>
                    <span
                      className={`absolute left-4 right-4 bottom-0 h-px bg-signal origin-left transition-transform duration-300 ease-out ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-hover:bg-fg-muted'
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <UtcClock className="hidden md:inline-block" />

          {/* Account (desktop) */}
          <div className="hidden lg:flex items-center h-full border-l border-line pl-6">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-fg transition-colors"
                >
                  <img src={user?.avatar || DEFAULT_AVATAR} alt="" className="w-6 h-6 object-cover grayscale" />
                  <span>{user?.name?.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div role="menu" className="absolute right-0 mt-4 w-60 surface border border-line-strong animate-zoom-in">
                    <div className="px-4 py-3 border-b border-line">
                      <p className="text-sm text-fg truncate">{user?.name}</p>
                      <p className="font-mono text-[0.625rem] text-fg-muted truncate mt-0.5">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      role="menuitem"
                      className="flex items-center justify-between px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-fg hover:bg-ink-800"
                    >
                      Mission Log
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-4 py-3 border-t border-line font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-danger hover:bg-ink-800"
                    >
                      Logout
                      <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-5 font-mono text-[0.6875rem] uppercase tracking-label">
                <Link to="/login" className="link-sweep text-fg-muted hover:text-fg">
                  Login
                </Link>
                <Link to="/register" className="h-9 px-4 flex items-center btn-gradient rounded-btn font-sans font-semibold normal-case tracking-normal text-[0.8125rem]">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="lg:hidden flex items-center gap-2 h-9 font-mono text-[0.6875rem] uppercase tracking-label text-fg"
          >
            <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="relative w-4 h-2.5" aria-hidden="true">
              <span className={`absolute left-0 right-0 h-px bg-fg transition-transform duration-300 ${mobileMenuOpen ? 'top-1/2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 right-0 h-px bg-fg transition-transform duration-300 ${mobileMenuOpen ? 'top-1/2 -rotate-45' : 'bottom-0'}`} />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile menu: full-screen typographic overlay */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden fixed inset-0 top-14 z-40 bg-ink animate-fade-in flex flex-col overflow-y-auto">
          <ul className="border-t border-line">
            {[{ index: '00', label: 'Index', to: '/', match: (p) => p === '/' }, ...NAV_ITEMS, ...(isAuthenticated ? [{ index: '05', label: 'Mission Log', to: '/dashboard', match: (p) => p === '/dashboard' }] : [])].map(
              (item, i) => {
                const active = isActive(item);
                return (
                  <li key={item.index} className="border-b border-line">
                    <Link
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className="flex items-baseline gap-4 px-5 py-5 animate-slide-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <span className={`font-mono text-xs ${active ? 'text-signal' : 'text-fg-faint'}`}>{item.index}</span>
                      <span className={`font-display text-5xl leading-none ${active ? 'text-fg' : 'text-fg-muted'}`}>{item.label}</span>
                    </Link>
                  </li>
                );
              }
            )}
          </ul>

          <div className="mt-auto p-5 border-t border-line space-y-5">
            <UtcClock showDate />
            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={user?.avatar || DEFAULT_AVATAR} alt="" className="w-9 h-9 object-cover grayscale" />
                  <span className="text-sm text-fg truncate">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-10 px-4 border border-line-strong font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted hover:text-danger hover:border-danger/50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 font-mono text-[0.6875rem] uppercase tracking-label">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center justify-center border border-line-strong text-fg">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="h-12 flex items-center justify-center btn-gradient rounded-btn font-sans font-semibold normal-case tracking-normal text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
