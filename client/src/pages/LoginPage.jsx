import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, LogIn, Lock, Mail, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/dashboard';

  const validateField = (field, value) => {
    if (field === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleBlur = (field, value) => {
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some((err) => err !== '')) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
    }
  };

  // Quick fill for university viva demonstration
  const handleFillDemo = () => {
    setEmail('astronaut@cosmichorizon.space');
    setPassword('MissionControl2026!');
    setFieldErrors({});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glowing backdrop accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-glow-cyan">
            <Orbit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Astronaut Sign In</h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access mission telemetry and your personal watchlist
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="astronaut@cosmichorizon.space"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  fieldErrors.email ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.email}</p>}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  fieldErrors.password ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            {fieldErrors.password && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.password}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-glow-cyan hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to CosmicHorizon</span>
              </>
            )}
          </button>
        </form>

        {/* Viva Demo Fill Button */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-cyan-400 border border-cyan-500/20 hover:bg-slate-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Credentials (For Viva)</span>
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Don't have an astronaut account yet?{' '}
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
