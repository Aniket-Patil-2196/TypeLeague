import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Input, CornerMarker } from '../../components/ui';
import { CropMarkBox } from '../../components/ui/CropMarkBox';

export const LoginPage = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingInvite = sessionStorage.getItem('pending_invite_token');
  const from = location.state?.from?.pathname || (pendingInvite ? `/invite/${pendingInvite}` : '/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!credential || !password) {
      setFormError('Please enter both your identifier and password.');
      return;
    }

    const res = await login({ credential, password });
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 font-mono">
      {/* Left Form Cell (5 cols) */}
      <div className="lg:col-span-5 p-8 sm:p-12 bg-surface border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-center relative">
        <CornerMarker position="top-left" size={8} />
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [AUTH // SEC_01] SESSION INITIALIZATION
            </span>
            <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
              ACCESS ACCOUNT
            </h1>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">
              Authenticate using your registered username or email address.
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username or Email Address"
              type="text"
              required
              placeholder="e.g. user_01 or name@domain.com"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              disabled={isLoading}
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-ink-muted hover:text-ink uppercase tracking-wider underline underline-offset-4"
                >
                  FORGOT PASSWORD?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={isLoading}
            >
              AUTHENTICATE AND ENTER
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-xs uppercase tracking-wider text-ink-soft flex items-center justify-between">
            <span>NO ACCOUNT RECORDED?</span>
            <Link to="/register" className="text-ink font-bold hover:text-accent underline underline-offset-4">
              REGISTER NEW ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      {/* Right Dark Panel Cell (7 cols) with Giant Display Tagline & Crop Marks */}
      <div className="lg:col-span-7 bg-panel text-surface p-8 sm:p-16 flex flex-col justify-between relative overflow-hidden select-none">
        <CropMarkBox inset={16} armLength={20} bracketColor="var(--panel-line)" className="h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink-muted border-b border-panel-line pb-4">
            <span>TYPELEAGUE IDENTITY CLUSTER</span>
            <span>NODE // ACTIVE</span>
          </div>

          <div className="my-12">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              [TELEMETRY PIPELINE]
            </span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase font-black text-surface tracking-tight leading-tight">
              TYPE.
              <br />
              COMPETE.
              <br />
              <span className="text-accent">CLIMB.</span>
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-6 max-w-lg leading-relaxed font-mono">
              Synchronized global typing events, anti-cheat timestamp verification, and permanent
              leaderboard archival for competitive typists.
            </p>
          </div>

          <div className="border-t border-panel-line pt-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted">
            <span>SECURITY LEVEL // ZERO TOLERANCE</span>
            <span>TOKEN ROTATION: ACTIVE</span>
          </div>
        </CropMarkBox>
      </div>
    </div>
  );
};
