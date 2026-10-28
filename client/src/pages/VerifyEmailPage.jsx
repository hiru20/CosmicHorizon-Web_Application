import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { MailCheck, MailX, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
            <h2 className="text-xl font-black text-white">Verifying your email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <MailCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-black text-white">Email Verified!</h2>
            <p className="text-xs text-slate-400">{message}</p>
            <div className="flex flex-col gap-2 pt-2">
              <a
                href="/dashboard"
                className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm shadow-glow-cyan"
              >
                Open Astronaut Dashboard
              </a>
              <Link to="/login" className="text-xs text-slate-400 hover:text-cyan-400">
                Or go to Sign In page
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <MailX className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-black text-white">Verification Failed</h2>
            <p className="text-xs text-slate-400">{message}</p>
            <Link to="/login" className="inline-block mt-2 text-xs text-cyan-400 font-bold hover:underline">
              Back to Sign In (you can request a new verification email there)
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
