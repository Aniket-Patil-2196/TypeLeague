import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  CropMarkBox,
  CornerMarker,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import { ShieldCheck, Users } from 'lucide-react';

export const JoinInvitePage = () => {
  const { token } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/invitations/${token}/verify`);
        setInvitation(res.data.data.invitation);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/invite/${token}` } } });
      return;
    }

    setJoining(true);
    try {
      const res = await api.post(`/invitations/${token}/join`);
      navigate(`/groups/${res.data.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md space-y-4">
          <Skeleton height="h-32" width="w-full" />
          <Skeleton height="h-8" width="w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md">
          <EmptyState
            title="INVITATION INVALID"
            description={error || 'This link has expired, been revoked, or reached its usage limit.'}
            actionLabel="EXPLORE COMMUNITIES"
            onAction={() => navigate('/groups')}
            indexLabel="[TOKEN_INVALID]"
          />
        </div>
      </div>
    );
  }

  const group = invitation.group;

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 font-mono bg-bg">
      <div className="w-full max-w-lg bg-surface border border-line p-8 relative">
        <CornerMarker position="top-left" size={8} />

        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
            [CRYPTOGRAPHIC INVITATION VERIFIED]
          </span>
          <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
            JOIN COMMUNITY
          </h1>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            You have received an authorized invitation to join this typing circle.
          </p>
        </div>

        {/* Group Preview Card */}
        <CropMarkBox
          inset={10}
          armLength={12}
          className="border border-line bg-bg p-6 mb-8 text-center"
        >
          <div className="w-16 h-16 bg-panel border border-panel-line mx-auto mb-3 flex items-center justify-center">
            <span className="font-display font-black text-2xl text-surface">
              {group.name.slice(0, 2).toUpperCase()}
            </span>
          </div>

          <h2 className="font-display text-lg uppercase font-bold text-ink mb-1">
            {group.name}
          </h2>
          <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto mb-4">
            {group.description || 'Private competitive community.'}
          </p>

          <div className="flex items-center justify-center gap-6 text-xs text-ink-muted border-t border-line pt-3">
            <span className="uppercase">{group.category}</span>
            <span>&middot;</span>
            <span className="tabular-nums font-semibold text-ink">
              {group.stats?.memberCount || 1} MEMBERS
            </span>
            <span>&middot;</span>
            <span className="uppercase">{group.visibility}</span>
          </div>
        </CropMarkBox>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={joining}
            onClick={handleAccept}
          >
            {isAuthenticated ? 'ACCEPT INVITATION & ENTER' : 'AUTHENTICATE TO ACCEPT'}
          </Button>

          <div className="text-center">
            <Link
              to="/groups"
              className="text-xs text-ink-muted hover:text-ink uppercase underline underline-offset-4"
            >
              DECLINE AND RETURN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
