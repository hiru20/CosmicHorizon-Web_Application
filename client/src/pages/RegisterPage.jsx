import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { Orbit, UserPlus, Lock, Mail, User, MailCheck, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline per-field validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  // Set after a successful sign-up: { email }
  const [registered, setRegistered] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification(registered.email);
      notifySuccess('A new verification email has been sent to your inbox.');
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
      const data = await authService.verifyEmailCode(registered.email, otpCode.trim());
      if (data?.token) {
        localStorage.setItem('cosmic_token', data.token);
        notifySuccess('Email verified! Redirecting to your Astronaut Dashboard...');
        window.location.href = '/dashboard';
      } else {
        notifySuccess('Email verified! You can now sign in.');
        window.location.href = '/login';
      }
    } catch (error) {
      notifyError(error.message || 'Invalid or expired verification code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Validate a single field and return an error string (or '')
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field, value) => {
    const err = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Run all validations before submit
    const errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    setFieldErrors(errors);

    if (Object.values(errors).some((err) => err !== '')) return;

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      setRegistered({
        email: result.data?.email || email,
      });
    } else {
      setErrorMsg(result.error || 'Registration failed.');
    }
  };

  // After sign-up: ask the user to verify their email via 6-digit code OR email link
  if (registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <MailCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Verify Your Email</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We sent a verification email to{' '}
            <span className="text-slate-200 font-bold">{registered.email}</span>. Enter the{' '}
            <b className="text-cyan-300">6-digit verification code</b> from your email below, or click the verification button inside the email.
          </p>

          <form onSubmit={handleVerifyCode} className="space-y-3 pt-1">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isVerifyingCode || otpCode.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-glow-cyan hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifyingCode ? 'Verifying...' : 'Verify & Activate Account'}</span>
            </button>
          </form>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:text-white disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
            <Link to="/login" className="text-xs text-cyan-400 font-bold hover:underline pt-1">
              Already verified? Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-glow-cyan">
            <Orbit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Astronaut Account</h2>
          <p className="text-xs text-slate-400">
            Join CosmicHorizon to save space missions, track satellites, and customize your dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Astronaut Call Sign / Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="Commander John Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  fieldErrors.name ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            {fieldErrors.name && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="pilot@mission.org"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  fieldErrors.email ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Security Password (min 6 characters)</label>
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  fieldErrors.confirmPassword ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-0.5">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-glow-cyan hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Creating Astronaut Credentials...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
