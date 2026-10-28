import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import AuthShell, { StepLabel, ErrorBar, PasswordToggle } from '../components/auth/AuthShell';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
  const [showPassword, setShowPassword] = useState(false); // UI only
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
    <AuthShell
      code="AUTH / 01 — Sign in"
      statement={
        <>
          Clearance <span className="italic text-fg-muted">required.</span>
        </>
      }
      mobileStatement={
        <>
          Clearance
          <br />
          <span className="italic text-fg-muted">required.</span>
        </>
      }
      standfirst="Sign in to open your mission log: saved discoveries, the launch watchlist and reminders you have set."
    >
      <div className="w-full max-w-md mx-auto lg:mx-0 space-y-8">
        {errorMsg && (
          <div className="space-y-5 animate-slide-up">
            <ErrorBar>{errorMsg}</ErrorBar>
            {needsVerification && (
              <div className="border-t border-line pt-5 space-y-4">
                <p className="text-sm text-fg-muted leading-relaxed">
                  Enter the 6-digit code sent to <span className="text-fg">{email}</span>.
                </p>
                <form onSubmit={handleVerifyCode} className="flex items-end gap-3">
                  <label htmlFor="login-otp" className="sr-only">
                    Verification code
                  </label>
                  <input
                    id="login-otp"
                    name="otp"
                    autoComplete="one-time-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="field flex-1 font-mono text-2xl text-fg tracking-[0.5em] placeholder-fg-faint"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={isVerifyingCode || otpCode.length < 6}
                    loading={isVerifyingCode}
                  >
                    Verify
                  </Button>
                </form>
                <Button variant="link" onClick={handleResend} disabled={isResending}>
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <StepLabel index="01">Credentials</StepLabel>
          <div className="space-y-7">
            <Input
              label="Email address"
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="astronaut@cosmichorizon.space"
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              placeholder="••••••••"
              error={fieldErrors.password}
              rightSlot={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} controls="login-password" />}
            />
          </div>

          <Button type="submit" size="lg" loading={isSubmitting} iconRight={ArrowRight} className="w-full justify-between mt-10">
            {isSubmitting ? 'Authenticating...' : 'Sign in'}
          </Button>
        </form>

        <div className="border-t border-line pt-6 flex flex-wrap items-center justify-between gap-4">
          <Button variant="link" onClick={handleFillDemo} className="text-fg-muted">
            Fill demo account
          </Button>
          <p className="font-mono text-label uppercase text-fg-faint">
            No account?{' '}
            <Link to="/register" className="link-sweep text-fg hover:text-signal">
              Register
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
};

export default LoginPage;
