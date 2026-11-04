import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  Cell,
  ProgressBar,
  CornerMarker,
  EmptyState,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  Zap,
  Target,
  Flame,
  Award,
  Users,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const res = await api.get('/groups/user/me');
        setJoinedGroups(res.data.data.groups || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchJoined();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;
  // XP formula for level: level * 100
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXp % 100;
  const xpProgress = Math.min(Math.round((xpInCurrentLevel / 100) * 100), 100);

  return (
    <div className="font-mono text-ink bg-bg p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Welcome Cell */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [STATUS: READY] // PILOT OVERVIEW
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              {getGreeting()}, {user?.fullName || user?.username || 'Contender'}.
            </h1>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">
              System verified. Today's synchronized global challenge is now available for qualification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/arena">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <Play size={16} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
                <span>START GLOBAL ARENA</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics 4-Cell Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Level & XP */}
        <div className="border border-line bg-surface p-5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider mb-3">
            <span>LEVEL &amp; XP</span>
            <Award size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-accent" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display text-3xl font-bold text-ink leading-none">
                LVL {currentLevel}
              </span>
              <span className="text-xs text-ink-muted tabular-nums">
                ({currentXp} XP)
              </span>
            </div>
            <div className="space-y-1">
              <ProgressBar value={xpProgress} max={100} variant="accent" height="h-2" />
              <div className="flex justify-between text-[10px] text-ink-muted uppercase tabular-nums">
                <span>{xpInCurrentLevel} XP</span>
                <span>{100 - xpInCurrentLevel} XP TO LVL {currentLevel + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Best WPM */}
        <div className="border border-line bg-surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider mb-3">
            <span>BEST NET WPM</span>
            <Zap size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink" />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-ink leading-none tabular-nums">
              {(user?.stats?.bestWpm || 0).toFixed(1)}
            </div>
            <p className="text-[11px] text-ink-soft mt-1">PERSONAL PEAK RECORD</p>
          </div>
        </div>

        {/* Metric 3: Accuracy */}
        <div className="border border-line bg-surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider mb-3">
            <span>AVERAGE ACCURACY</span>
            <Target size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink" />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-ink leading-none tabular-nums">
              {(user?.stats?.averageAccuracy || 0).toFixed(1)}%
            </div>
            <p className="text-[11px] text-ink-soft mt-1">VERIFIED ATTEMPTS</p>
          </div>
        </div>

        {/* Metric 4: Daily Streak */}
        <div className="border border-line bg-surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider mb-3">
            <span>DAILY STREAK</span>
            <Flame size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-accent" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-ink leading-none tabular-nums">
                {user?.stats?.dailyStreak || 0}
              </span>
              <span className="text-xs text-ink-muted uppercase">DAYS</span>
            </div>
            <p className="text-[11px] text-ink-soft mt-1">
              LONGEST: {user?.stats?.longestStreak || 0} DAYS
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Columns: Global Challenge + Joined Groups + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (8 cols): Today's Global Challenge Banner & Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Global Challenge Cell */}
          <div className="border border-line bg-surface p-6 relative">
            <CornerMarker position="top-left" size={6} />
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-accent" />
                <span className="text-xs uppercase font-bold tracking-widest text-ink">
                  TODAY'S GLOBAL CHALLENGE
                </span>
              </div>
              <Badge variant="accent">SYNCHRONIZED</Badge>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-xl uppercase font-bold text-ink mb-2">
                DAILY BENCHMARK // 60-SECOND QUALIFIER
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
                Passage selected from the shared technology repository. Max attempts: 3.
                Rankings determined by unrounded Net WPM and accuracy tie-breaker.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border border-line bg-bg p-4 mb-6 text-xs uppercase tracking-wider text-ink-muted">
              <div>
                <span className="block text-[10px]">TIME DURATION</span>
                <span className="text-ink font-bold tabular-nums">60 SECONDS</span>
              </div>
              <div>
                <span className="block text-[10px]">ATTEMPTS ALLOWED</span>
                <span className="text-ink font-bold tabular-nums">3 ATTEMPTS</span>
              </div>
              <div>
                <span className="block text-[10px]">EXPIRY TIME</span>
                <span className="text-ink font-bold tabular-nums">23:59 IST</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-ink-muted">ATTEMPTS REMAINING: 3 OF 3</span>
              <Link to="/arena">
                <Button variant="primary" size="md">
                  ENTER ARENA
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Typing Activity Cell */}
          <Cell indexLabel="[LOG_01]" title="RECENT TYPING TELEMETRY">
            {user?.stats?.testsCompleted > 0 ? (
              <div className="text-xs text-ink">
                <p>Activity history recorded.</p>
              </div>
            ) : (
              <EmptyState
                title="NO ATTEMPTS RECORDED"
                description="You have not participated in any typing challenges yet. Enter the global arena to establish your baseline score."
                actionLabel="TAKE FIRST TEST"
                onAction={() => window.location.href = '/arena'}
                indexLabel="[TELEMETRY_EMPTY]"
              />
            )}
          </Cell>
        </div>

        {/* Right Col (4 cols): Joined Groups & Leaderboard Standings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Joined Groups Cell */}
          <Cell indexLabel="[GRP_01]" title="JOINED COMMUNITIES">
            {loadingGroups ? (
              <div className="space-y-3 py-2">
                <Skeleton height="h-14" width="w-full" />
                <Skeleton height="h-14" width="w-full" />
              </div>
            ) : joinedGroups.length > 0 ? (
              <div className="space-y-3">
                {joinedGroups.map((grp) => (
                  <div key={grp._id} className="border border-line bg-surface p-3.5 flex items-center justify-between hover:border-ink transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-sm text-ink uppercase line-clamp-1">
                          {grp.name}
                        </span>
                        <Badge
                          variant={grp.userRole === 'owner' ? 'accent' : grp.userRole === 'moderator' ? 'ok' : 'neutral'}
                          size="sm"
                        >
                          {grp.userRole}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-ink-muted uppercase">
                        {grp.stats?.memberCount || 1} MEMBERS &middot; {grp.category}
                      </span>
                    </div>
                    <Link to={`/groups/${grp._id}`}>
                      <Button variant="secondary" size="sm">
                        OPEN
                      </Button>
                    </Link>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/my-groups">
                    <Button variant="outline" size="sm" className="w-full">
                      VIEW ALL MY COMMUNITIES
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                title="NO COMMUNITIES JOINED"
                description="Join public communities or accept private clan invitations to compete with friends and batchmates."
                actionLabel="EXPLORE GROUPS"
                onAction={() => window.location.href = '/groups'}
                indexLabel="[CLAN_NONE]"
              />
            )}
          </Cell>

          {/* Current Rankings Cell */}
          <Cell indexLabel="[RNK_01]" title="CURRENT GROUP RANKINGS">
            <div className="text-center py-6">
              <p className="text-xs text-ink-muted leading-relaxed uppercase">
                Rankings will appear once you complete your first verified daily challenge.
              </p>
              <div className="mt-4">
                <Link to="/leaderboards">
                  <Button variant="secondary" size="sm" className="w-full">
                    VIEW GLOBAL LEADERBOARD
                  </Button>
                </Link>
              </div>
            </div>
          </Cell>
        </div>
      </div>
    </div>
  );
};
