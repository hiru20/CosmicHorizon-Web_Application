import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { ArrowRight } from 'lucide-react';
import AuthShell, { StepLabel, ErrorBar, PasswordToggle } from '../components/auth/AuthShell';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false); // UI only

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
      <AuthShell
        code="AUTH / 02 — Verify"
        statement={
          <>
            Check your <span className="italic text-fg-muted">inbox.</span>
          </>
        }
        mobileStatement={
          <>
            Check your
            <br />
            <span className="italic text-fg-muted">inbox.</span>
          </>
        }
        standfirst="One step left. Your account is created but stays locked until the email address is confirmed."
      >
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-8">
          <div>
            <StepLabel index="02">Verification</StepLabel>
            <p className="text-sm text-fg-muted leading-relaxed">
              We sent a verification email to <span className="text-fg">{registered.email}</span>. Enter the 6-digit code from
              that email below, or press the verification button inside it.
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-8 border-t border-line pt-8">
            <div>
              <label htmlFor="register-otp" className="label block mb-1">
                Verification code
              </label>
              <input
                id="register-otp"
                name="otp"
                autoComplete="one-time-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="field font-mono text-3xl sm:text-4xl text-fg tracking-[0.5em] placeholder-fg-faint py-3"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isVerifyingCode || otpCode.length < 6}
              loading={isVerifyingCode}
              iconRight={ArrowRight}
              className="w-full justify-between"
            >
              {isVerifyingCode ? 'Verifying...' : 'Verify & activate account'}
            </Button>
          </form>

          <div className="border-t border-line pt-6 flex flex-wrap items-center justify-between gap-4">
            <Button variant="link" onClick={handleResend} disabled={isResending} className="text-fg-muted">
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>
            <Link to="/login" className="link-sweep font-mono text-label uppercase text-fg hover:text-signal">
              Already verified? Sign in
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      code="AUTH / 01 — Register"
      statement={
        <>
          Join the crew <span className="italic text-fg-muted">manifest.</span>
        </>
      }
      mobileStatement={
        <>
          Join the crew
          <br />
          <span className="italic text-fg-muted">manifest.</span>
        </>
      }
      standfirst="An account keeps a log of what you find: favourite imagery, launches you are watching, and notes against each."
    >
      <div className="w-full max-w-md mx-auto lg:mx-0 space-y-8">
        {errorMsg && <ErrorBar className="animate-slide-up">{errorMsg}</ErrorBar>}

        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          <fieldset>
            <legend className="w-full">
              <StepLabel index="01">Identity</StepLabel>
            </legend>
            <div className="space-y-7">
              <Input
                label="Call sign / name"
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="Commander John Doe"
                error={fieldErrors.name}
              />
              <Input
                label="Email address"
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="pilot@mission.org"
                error={fieldErrors.email}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full">
              <StepLabel index="02">Security</StepLabel>
            </legend>
            <div className="space-y-7">
              <Input
                label="Password"
                hint="Minimum 6 characters"
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder="••••••••"
                error={fieldErrors.password}
                rightSlot={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} controls="register-password register-confirm" />}
              />
              <Input
                label="Confirm password"
                id="register-confirm"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                placeholder="••••••••"
                error={fieldErrors.confirmPassword}
              />
            </div>
          </fieldset>

          <Button type="submit" size="lg" loading={isSubmitting} iconRight={ArrowRight} className="w-full justify-between">
            {isSubmitting ? 'Creating credentials...' : 'Complete registration'}
          </Button>
        </form>

        <p className="border-t border-line pt-6 font-mono text-label uppercase text-fg-faint">
          Already have an account?{' '}
          <Link to="/login" className="link-sweep text-fg hover:text-signal">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default RegisterPage;
