import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Button, Input, CornerMarker } from '../../components/ui';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, message: '' });

    if (newPassword !== confirmPassword) {
      setStatus({ loading: false, success: false, message: 'Passwords do not match.' });
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setStatus({
        loading: false,
        success: true,
        message: res.data.data.message || 'Password reset successful.',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'Password reset failed or token expired.',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 font-mono bg-bg">
      <div className="w-full max-w-md bg-surface border border-line p-8 relative">
        <CornerMarker position="top-left" size={8} />

        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
            [RECOVERY // SEC_04] SET NEW PASSWORD
          </span>
          <h1 className="font-display text-2xl uppercase font-bold text-ink">
            UPDATE CREDENTIALS
          </h1>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Specify a new minimum 8-character password. All active sessions will be invalidated.
          </p>
        </div>

        {status.message && (
          <div
            className={`mb-6 p-3 border text-xs leading-relaxed ${
              status.success ? 'border-ok text-ok bg-bg' : 'border-error text-error bg-bg'
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password (8+ chars)"
            type="password"
            required
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={status.loading}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={status.loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={status.loading}
          >
            COMMIT NEW PASSWORD
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
