import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  Badge,
  Tabs,
  Avatar,
  CornerMarker,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import { ArrowUp, ArrowDown, Minus, Trophy } from 'lucide-react';

export const LeaderboardsPage = () => {
  const { user } = useAuthStore();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all-time');
  const [scope, setScope] = useState('global');
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const res = await api.get('/groups/user/me');
        setUserGroups(res.data.data.groups || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserGroups();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/gamification/leaderboard?scope=${scope}&period=${period}`;
      if (scope === 'group' && selectedGroupId) {
        url += `&groupId=${selectedGroupId}`;
      }
      const res = await api.get(url);
      setStandings(res.data.data.standings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, selectedGroupId, period]);

  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];

  // Pinned user if outside visible top rows
  const userRankIndex = standings.findIndex((s) => s.user?._id === user?._id);
  const currentUserStanding = userRankIndex !== -1 ? standings[userRankIndex] : null;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto font-mono text-ink space-y-6">
      {/* Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [STANDINGS // OFFICIAL_BENCHMARKS]
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              LEADERBOARDS
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Official rankings calculated from unrounded Net WPM and accuracy tie-breaker.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 border text-xs uppercase ${
                period === 'daily' ? 'bg-ink text-surface border-ink' : 'bg-surface text-ink border-line'
              }`}
            >
              DAILY
            </button>
            <button
              type="button"
              onClick={() => setPeriod('all-time')}
              className={`px-3 py-1.5 border text-xs uppercase ${
                period === 'all-time' ? 'bg-ink text-surface border-ink' : 'bg-surface text-ink border-line'
              }`}
            >
              ALL-TIME
            </button>
          </div>
        </div>

        {/* Community Scope Filter Tabs */}
        {userGroups.length > 0 && (
          <div className="mt-6 pt-4 border-t border-line flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-muted uppercase mr-1 text-[11px] font-bold">ROSTER SCOPE:</span>
            <button
              type="button"
              onClick={() => {
                setScope('global');
                setSelectedGroupId(null);
              }}
              className={`px-3 py-1 border uppercase text-[11px] font-bold tracking-wider ${
                scope === 'global' ? 'bg-ink text-surface border-ink' : 'bg-surface text-ink-muted border-line hover:text-ink'
              }`}
            >
              GLOBAL ARENA
            </button>
            {userGroups.map((grp) => (
              <button
                key={grp._id}
                type="button"
                onClick={() => {
                  setScope('group');
                  setSelectedGroupId(grp._id);
                }}
                className={`px-3 py-1 border uppercase text-[11px] font-bold tracking-wider ${
                  scope === 'group' && selectedGroupId === grp._id
                    ? 'bg-accent text-ink border-ink'
                    : 'bg-surface text-ink-muted border-line hover:text-ink'
                }`}
              >
                {grp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton height="h-56" width="w-full" />
          <Skeleton height="h-64" width="w-full" />
        </div>
      ) : standings.length === 0 ? (
        <EmptyState
          title="NO STANDINGS RECORDED"
          description="No completed competition attempts recorded for this period yet."
          indexLabel="[STANDINGS_ZERO]"
        />
      ) : (
        <div className="space-y-6">
          {/* Stepped Podium (2nd, 1st, 3rd) */}
          {top1 && (
            <div className="border border-line bg-surface p-6">
              <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 mb-3">
                {/* 2nd Place: Ink Fill, Surface Text */}
                {top2 ? (
                  <div className="bg-ink text-surface border border-ink p-4 flex flex-col justify-between h-48 sm:h-56 relative">
                    <div className="flex items-start justify-between">
                      <span className="font-display font-black text-3xl sm:text-4xl text-surface leading-none">
                        02
                      </span>
                      <Avatar name={top2.user?.fullName || top2.user?.username} size={36} border={false} className="bg-surface text-ink" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold truncate text-surface">
                        {top2.user?.username}
                      </p>
                      <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
                        {top2.wpm?.toFixed(1)} WPM &middot; {top2.accuracy?.toFixed(1)}%
                      </p>
                      <p className="text-sm font-bold text-accent tabular-nums mt-1">
                        {top2.score?.toFixed(1)} PTS
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-line bg-bg h-40 flex items-center justify-center text-xs text-ink-muted">
                    02 EMPTY
                  </div>
                )}

                {/* 1st Place: Tallest, Accent Fill, Ink Text */}
                <div className="bg-accent text-ink border border-accent p-4 sm:p-5 flex flex-col justify-between h-56 sm:h-64 relative">
                  <CornerMarker position="top-left" size={8} className="bg-ink" />
                  <CornerMarker position="top-right" size={8} className="bg-ink" />
                  <div className="flex items-start justify-between">
                    <span className="font-display font-black text-4xl sm:text-5xl text-ink leading-none">
                      01
                    </span>
                    <Avatar name={top1.user?.fullName || top1.user?.username} size={42} border={false} className="bg-ink text-surface" />
                  </div>
                  <div>
                    <div className="inline-block bg-ink text-accent text-[9px] uppercase px-1.5 py-0.5 font-bold mb-1">
                      CHAMPION
                    </div>
                    <p className="text-sm uppercase font-bold truncate text-ink">
                      {top1.user?.username}
                    </p>
                    <p className="text-xs text-ink/80 tabular-nums mt-0.5 font-medium">
                      {top1.wpm?.toFixed(1)} WPM &middot; {top1.accuracy?.toFixed(1)}%
                    </p>
                    <p className="text-base font-black text-ink tabular-nums mt-1">
                      {top1.score?.toFixed(1)} PTS
                    </p>
                  </div>
                </div>

                {/* 3rd Place: Surface with 1px ink border */}
                {top3 ? (
                  <div className="bg-surface text-ink border border-ink p-4 flex flex-col justify-between h-40 sm:h-48 relative">
                    <div className="flex items-start justify-between">
                      <span className="font-display font-black text-2xl sm:text-3xl text-ink leading-none">
                        03
                      </span>
                      <Avatar name={top3.user?.fullName || top3.user?.username} size={32} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold truncate text-ink">
                        {top3.user?.username}
                      </p>
                      <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
                        {top3.wpm?.toFixed(1)} WPM &middot; {top3.accuracy?.toFixed(1)}%
                      </p>
                      <p className="text-sm font-bold text-ink tabular-nums mt-1">
                        {top3.score?.toFixed(1)} PTS
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-line bg-bg h-36 flex items-center justify-center text-xs text-ink-muted">
                    03 EMPTY
                  </div>
                )}
              </div>

              {/* Podium Base Strip */}
              <div className="h-4 bg-panel border border-panel-line w-full flex items-center justify-between px-3">
                <span className="text-[9px] uppercase font-mono tracking-widest text-ink-muted">
                  OFFICIAL STANDINGS // PODIUM
                </span>
                <span className="text-[9px] font-mono text-accent">TOP CONTENDERS</span>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-bg border-b border-line text-ink-muted uppercase tracking-wider text-left">
                  <th className="p-3 border-r border-line w-16 text-center">RANK</th>
                  <th className="p-3 border-r border-line">CONTENDER</th>
                  <th className="p-3 border-r border-line text-right">NET WPM</th>
                  <th className="p-3 border-r border-line text-right">ACCURACY</th>
                  <th className="p-3 border-r border-line text-right">SCORE</th>
                  <th className="p-3 text-center">DELTA</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => {
                  const isCurrent = row.user?._id === user?._id;
                  return (
                    <tr
                      key={row.rank}
                      className={`border-b border-line last:border-b-0 hover:bg-bg transition-colors ${
                        isCurrent ? 'bg-bg relative font-bold' : ''
                      }`}
                    >
                      <td className="p-3 border-r border-line text-center tabular-nums font-semibold relative">
                        {isCurrent && (
                          <>
                            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
                            <CornerMarker position="top-left" size={4} />
                          </>
                        )}
                        {String(row.rank).padStart(2, '0')}
                      </td>
                      <td className="p-3 border-r border-line flex items-center gap-3">
                        <Avatar name={row.user?.fullName || row.user?.username} size={26} />
                        <span className={`uppercase ${isCurrent ? 'text-accent' : 'text-ink'}`}>
                          {row.user?.username} {isCurrent && '(YOU)'}
                        </span>
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums">
                        {row.wpm?.toFixed(1)}
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums">
                        {row.accuracy?.toFixed(1)}%
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums font-bold text-ink">
                        {row.score?.toFixed(1)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                          {row.delta > 0 && (
                            <>
                              <ArrowUp size={12} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" className="text-ok" />
                              <span className="text-ok">+{row.delta}</span>
                            </>
                          )}
                          {row.delta < 0 && (
                            <>
                              <ArrowDown size={12} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" className="text-error" />
                              <span className="text-error">{row.delta}</span>
                            </>
                          )}
                          {row.delta === 0 && (
                            <Minus size={12} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" className="text-ink-muted" />
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pinned User Position Row if logged in */}
            {currentUserStanding && (
              <div className="border-t-2 border-accent bg-bg p-3 px-4 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-accent font-bold">YOUR RANK: #{currentUserStanding.rank}</span>
                  <span className="text-ink uppercase font-medium">{user?.username}</span>
                </div>
                <div className="flex items-center gap-6 tabular-nums">
                  <span>{currentUserStanding.wpm?.toFixed(1)} NET WPM</span>
                  <span>{currentUserStanding.accuracy?.toFixed(1)}% ACC</span>
                  <strong className="text-accent">{currentUserStanding.score?.toFixed(1)} PTS</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
