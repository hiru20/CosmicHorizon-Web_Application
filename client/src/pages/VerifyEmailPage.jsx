import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { ArrowRight } from 'lucide-react';
import AuthShell, { StepLabel, ErrorBar } from '../components/auth/AuthShell';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import LiveDot from '../components/common/LiveDot';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const hasRun = useRef(false); // React StrictMode runs effects twice; the token is single-use

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        const jwtToken = res?.data?.token || res?.token;
        if (jwtToken) {
          localStorage.setItem('cosmic_token', jwtToken);
        }
        setMessage(res.message || 'Email verified successfully.');
        setStatus('success');
      } catch (error) {
        setMessage(error.message || 'Verification failed.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  const statement =
    status === 'success' ? (
      <>
        Channel <span className="italic text-fg-muted">open.</span>
      </>
    ) : status === 'error' ? (
      <>
        Link <span className="italic text-fg-muted">rejected.</span>
      </>
    ) : (
      <>
        Checking <span className="italic text-fg-muted">clearance.</span>
      </>
    );

  return (
    <AuthShell code="AUTH / 03 — Email link" statement={statement}>
      <div className="w-full max-w-md mx-auto lg:mx-0" aria-live="polite">
        <StepLabel index="03">Verification status</StepLabel>

        {status === 'loading' && <Loader message="Verifying your email..." />}

        {status === 'success' && (
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <LiveDot label="Email verified" />
              <h2 className="font-display text-display-sm text-fg">Email verified.</h2>
              <p className="text-sm text-fg-muted leading-relaxed">{message}</p>
            </div>
            <div className="border-t border-line pt-6 flex flex-wrap items-center justify-between gap-4">
              {/* Full page load so the auth context picks up the stored token */}
              <Button href="/dashboard" size="lg" iconRight={ArrowRight}>
                Open dashboard
              </Button>
              <Link to="/login" className="link-sweep font-mono text-label uppercase text-fg-muted hover:text-fg">
                Or go to sign in
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h2 className="font-display text-display-sm text-fg">Verification failed.</h2>
              <ErrorBar>{message}</ErrorBar>
            </div>
            <div className="border-t border-line pt-6">
              <Link to="/login" className="link-sweep font-mono text-label uppercase text-fg hover:text-signal">
                Back to sign in — request a new verification email there
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
};

export default VerifyEmailPage;
