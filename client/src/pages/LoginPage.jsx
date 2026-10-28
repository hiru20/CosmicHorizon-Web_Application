import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orbit, LogIn, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/dashboard';

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      notifySuccess('A new verification email with a 6-digit code has been sent.');
    } catch (error) {
      notifyError(error.message || 'Could not resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      notifyError('Please enter the 6-digit verification code from your email.');
      return;
    }
    setIsVerifyingCode(true);
    try {
      const data = await authService.verifyEmailCode(email, otpCode.trim());
      if (data?.token) {
        localStorage.setItem('cosmic_token', data.token);
        notifySuccess('Email verified! Redirecting to your Astronaut Dashboard...');
        window.location.href = destination;
      }
    } catch (error) {
      notifyError(error.message || 'Invalid or expired verification code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

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
    setNeedsVerification(false);

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
      setNeedsVerification(result.status === 403);
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail('astronaut@cosmichorizon.space');
    setPassword('MissionControl2026!');
    setFieldErrors({});
    setErrorMsg('');
    setNeedsVerification(false);
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
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center space-y-3">
            <p>{errorMsg}</p>
            {needsVerification && (
              <div className="space-y-2.5 pt-2 border-t border-rose-500/20">
                <p className="text-slate-300">
                  Enter the <b className="text-cyan-300">6-digit code</b> sent to <b>{email}</b>:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="flex-1 text-center tracking-[0.35em] font-mono text-sm font-bold py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingCode || otpCode.length < 6}
                    onClick={handleVerifyCode}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isVerifyingCode ? '...' : 'Verify'}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="block mx-auto text-cyan-400 font-bold hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}
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
                placeholder="••••••••"
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

        {/* Demo Fill Button */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-cyan-400 border border-cyan-500/20 hover:bg-slate-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Account</span>
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
