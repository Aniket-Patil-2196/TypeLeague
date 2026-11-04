import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Avatar,
  Cell,
  ProgressBar,
  CornerMarker,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/gamification/analytics');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;
  const xpInCurrentLevel = currentXp % 100;
  const xpProgress = Math.min(Math.round((xpInCurrentLevel / 100) * 100), 100);

  const chartData = analytics?.recentAttempts?.length > 0
    ? [...analytics.recentAttempts].reverse().map((a, i) => ({
        index: i + 1,
        wpm: Math.round(a.wpm),
        accuracy: Math.round(a.accuracy),
      }))
    : [
        { index: 1, wpm: 0, accuracy: 100 },
        { index: 2, wpm: Math.round(user?.stats?.bestWpm || 0), accuracy: Math.round(user?.stats?.averageAccuracy || 100) },
      ];

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto font-mono text-ink space-y-6">
      {/* Profile Header Cell */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={user?.fullName || user?.username} size={72} border={true} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
                {user?.fullName || user?.username}
              </h1>
              <Badge variant="accent">CONTENDER</Badge>
              <Badge variant="outline">LEVEL {currentLevel}</Badge>
            </div>
            <p className="text-xs text-ink-muted uppercase">@{user?.username} &middot; {user?.email}</p>
            <p className="text-xs text-ink-soft mt-2">{user?.bio || 'Verified competitive pilot.'}</p>
          </div>
        </div>
      </div>

      {/* Progress & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Cell indexLabel="[STAT_01]" title="PRESTIGE &amp; XP">
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="font-display text-3xl font-bold">LVL {currentLevel}</span>
              <span className="text-xs text-ink-muted tabular-nums">{currentXp} TOTAL XP</span>
            </div>
            <ProgressBar value={xpProgress} max={100} variant="accent" />
            <div className="flex justify-between text-[10px] text-ink-muted uppercase">
              <span>PROGRESS</span>
              <span>{100 - xpInCurrentLevel} XP TO NEXT LEVEL</span>
            </div>
          </div>
        </Cell>

        <Cell indexLabel="[STAT_02]" title="VELOCITY RECORDS">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-line">
              <span className="text-ink-muted">PEAK NET WPM</span>
              <span className="font-bold tabular-nums">{(user?.stats?.bestWpm || 0).toFixed(1)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span className="text-ink-muted">ACCURACY</span>
              <span className="font-bold tabular-nums">{(user?.stats?.averageAccuracy || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">TESTS COMPLETED</span>
              <span className="font-bold tabular-nums">{user?.stats?.testsCompleted || 0}</span>
            </div>
          </div>
        </Cell>

        <Cell indexLabel="[STAT_03]" title="STREAK DATA">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-line">
              <span className="text-ink-muted">ACTIVE STREAK</span>
              <span className="font-bold text-accent tabular-nums">{user?.stats?.dailyStreak || 0} DAYS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line">
              <span className="text-ink-muted">LONGEST STREAK</span>
              <span className="font-bold tabular-nums">{user?.stats?.longestStreak || 0} DAYS</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-muted">TIMEZONE</span>
              <span className="font-bold">Asia/Kolkata</span>
            </div>
          </div>
        </Cell>
      </div>

      {/* Flat Mechanical Velocity Chart */}
      <Cell indexLabel="[CHART_01]" title="HISTORICAL VELOCITY TELEMETRY (NET WPM)">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="0" />
              <XAxis
                dataKey="index"
                stroke="var(--ink-muted)"
                tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="var(--ink-muted)"
                tick={{ fill: 'var(--ink-muted)', fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="border border-line bg-surface p-2 text-xs font-mono">
                        <p className="font-bold text-ink">ATTEMPT #{payload[0].payload.index}</p>
                        <p className="text-accent">{payload[0].value} NET WPM</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="linear"
                dataKey="wpm"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ stroke: 'var(--ink)', strokeWidth: 1, fill: 'var(--accent)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Cell>
    </div>
  );
};
