import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Input, CornerMarker } from '../../components/ui';
import { CropMarkBox } from '../../components/ui/CropMarkBox';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingInvite = sessionStorage.getItem('pending_invite_token');
  const redirectTarget = location.state?.from?.pathname || (pendingInvite ? `/invite/${pendingInvite}` : '/dashboard');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Password confirmation does not match.');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 font-mono">
      {/* Left Form Cell (6 cols) */}
      <div className="lg:col-span-6 p-8 sm:p-12 bg-surface border-b lg:border-b-0 lg:border-r border-line flex flex-col justify-center relative">
        <CornerMarker position="top-left" size={8} />
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [AUTH // SEC_02] CONTENDER REGISTRATION
            </span>
            <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
              CREATE CONTENDER ACCOUNT
            </h1>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">
              Register a unique identity to compete in daily typing challenges.
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Legal or Display Name"
              type="text"
              name="fullName"
              required
              placeholder="e.g. Alex Mercer"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Input
              label="Username (Alphanumeric and underscores)"
              type="text"
              name="username"
              required
              placeholder="e.g. alex_99"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Input
              label="Email Address (Normalized)"
              type="email"
              name="email"
              required
              placeholder="e.g. name@domain.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password (8+ chars)"
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              loading={isLoading}
            >
              CREATE AND INITIALIZE ACCOUNT
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-xs uppercase tracking-wider text-ink-soft flex items-center justify-between">
            <span>ALREADY REGISTERED?</span>
            <Link to="/login" className="text-ink font-bold hover:text-accent underline underline-offset-4">
              LOG IN TO PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* Right Dark Panel Cell (6 cols) */}
      <div className="lg:col-span-6 bg-panel text-surface p-8 sm:p-16 flex flex-col justify-between relative overflow-hidden select-none">
        <CropMarkBox inset={16} armLength={20} bracketColor="var(--panel-line)" className="h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink-muted border-b border-panel-line pb-4">
            <span>TYPELEAGUE IDENTITY SPEC</span>
            <span>SYSTEM DIRECTORY</span>
          </div>

          <div className="my-10 space-y-6">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block">
              [COMMUNITY MEMBERSHIP GUARANTEES]
            </span>
            <div className="space-y-4">
              <div className="border border-panel-line p-4 bg-panel">
                <h4 className="text-xs uppercase font-bold text-surface mb-1">01. UNROUNDED SCORING</h4>
                <p className="text-xs text-ink-muted">Raw score computation without display rounding errors.</p>
              </div>
              <div className="border border-panel-line p-4 bg-panel">
                <h4 className="text-xs uppercase font-bold text-surface mb-1">02. PRIVATE GROUP CLANS</h4>
                <p className="text-xs text-ink-muted">Form invite-only circles with custom texts and daily challenges.</p>
              </div>
              <div className="border border-panel-line p-4 bg-panel">
                <h4 className="text-xs uppercase font-bold text-surface mb-1">03. VERIFIED LEADERBOARDS</h4>
                <p className="text-xs text-ink-muted">Keystroke timestamps validated on centralized server cluster.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-panel-line pt-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted">
            <span>STRICT DESIGN SPEC</span>
            <span>NO EMOJI &middot; NO GRADIENTS</span>
          </div>
        </CropMarkBox>
      </div>
    </div>
  );
};
