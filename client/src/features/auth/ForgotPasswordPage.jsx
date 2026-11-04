import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button, Input, CornerMarker } from '../../components/ui';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '', devLink: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, message: '', devLink: '' });

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus({
        loading: false,
        success: true,
        message: res.data.data.message,
        devLink: res.data.data.devResetUrl || '',
      });
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch password reset request.',
        devLink: '',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 font-mono bg-bg">
      <div className="w-full max-w-md bg-surface border border-line p-8 relative">
        <CornerMarker position="top-left" size={8} />

        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
            [RECOVERY // SEC_03] CREDENTIAL RESET
          </span>
          <h1 className="font-display text-2xl uppercase font-bold text-ink">
            RESET PASSWORD
          </h1>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Enter your registered email address. If an account matches, a cryptographic reset token will be issued.
          </p>
        </div>

        {status.message && (
          <div
            className={`mb-6 p-3 border text-xs leading-relaxed ${
              status.success ? 'border-ok text-ok bg-bg' : 'border-error text-error bg-bg'
            }`}
          >
            {status.message}
            {status.devLink && (
              <div className="mt-3 pt-3 border-t border-line text-[11px] text-ink">
                <strong>[DEV MODE LINK]:</strong>
                <a href={status.devLink} className="block mt-1 underline text-accent break-all">
                  {status.devLink}
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registered Email Address"
            type="email"
            required
            placeholder="e.g. name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status.loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={status.loading}
          >
            DISPATCH RESET LINK
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-line text-xs uppercase tracking-wider text-ink-muted text-center">
          <Link to="/login" className="hover:text-ink underline underline-offset-4">
            RETURN TO AUTHENTICATION
          </Link>
        </div>
      </div>
    </div>
  );
};
