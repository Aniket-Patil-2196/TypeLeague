import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Button,
  Badge,
  CropMarkBox,
  CornerMarker,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import { Users, Plus, Shield, ShieldAlert, UserCheck } from 'lucide-react';

export const MyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMyGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/groups/user/me');
      setGroups(res.data.data.groups || []);
    } catch (err) {
      setError('Failed to fetch your joined groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto font-mono text-ink space-y-8">
      {/* Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [AFFILIATIONS // MY_CLANS]
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              MY COMMUNITIES
            </h1>
            <p className="text-xs text-ink-soft mt-1 max-w-2xl leading-relaxed">
              Active memberships, founder workspaces, and moderator duties.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/groups">
              <Button variant="secondary" size="md">
                EXPLORE ALL
              </Button>
            </Link>
            <Link to="/groups/create">
              <Button variant="primary" size="md" className="flex items-center gap-2">
                <Plus size={16} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
                <span>CREATE NEW</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-line bg-surface p-6 space-y-4">
              <Skeleton height="h-28" width="w-full" />
              <Skeleton height="h-4" width="w-3/4" />
              <Skeleton height="h-3" width="w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="FAILED TO RETRIEVE AFFILIATIONS"
          description={error}
          actionLabel="RETRY"
          onAction={fetchMyGroups}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="NO MEMBERSHIPS RECORDED"
          description="You are not enrolled in any typing clan or community yet. Browse public groups or create your own."
          actionLabel="EXPLORE GROUPS"
          onAction={() => navigate('/groups')}
          indexLabel="[ENROLLMENT_ZERO]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((grp) => {
            const initials = grp.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const roleVariant =
              grp.userRole === 'owner' ? 'accent' : grp.userRole === 'moderator' ? 'ok' : 'neutral';

            return (
              <div
                key={grp._id}
                className="border border-line bg-surface hover:bg-bg transition-colors duration-100 flex flex-col justify-between relative group"
              >
                <CornerMarker position="top-left" size={6} />

                {/* Banner Header */}
                <div className="h-32 border-b border-line bg-panel relative flex items-center justify-center overflow-hidden">
                  {grp.coverImage ? (
                    <img
                      src={grp.coverImage}
                      alt={grp.name}
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  ) : (
                    <CropMarkBox
                      inset={8}
                      armLength={12}
                      bracketColor="var(--panel-line)"
                      className="w-full h-full flex flex-col items-center justify-center"
                    >
                      <span className="font-display font-black text-3xl text-surface tracking-wider">
                        {initials}
                      </span>
                    </CropMarkBox>
                  )}
                  <span className="absolute top-2 right-2">
                    <Badge variant={roleVariant} size="sm">
                      {grp.userRole}
                    </Badge>
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-ink-muted uppercase">
                        {grp.visibility} CLAN
                      </span>
                      <span>&middot;</span>
                      <span className="text-[10px] text-ink-muted uppercase">
                        {grp.category}
                      </span>
                    </div>
                    <h3 className="font-display text-base uppercase font-bold text-ink mb-2 line-clamp-1">
                      {grp.name}
                    </h3>
                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed mb-4">
                      {grp.description || 'No public charter supplied.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink" />
                      <span className="tabular-nums font-semibold text-ink">
                        {grp.stats?.memberCount || 1}
                      </span>
                      <span>MEMBERS</span>
                    </div>

                    <Link to={`/groups/${grp._id}`}>
                      <Button variant="secondary" size="sm">
                        OPEN DASHBOARD
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
