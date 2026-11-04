import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Badge,
  CornerMarker,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import {
  Play,
  Zap,
  Flame,
  Trophy,
  Target,
  Calendar,
  Clock,
  Award,
  Shield,
  Lock,
} from 'lucide-react';

const ICON_MAP = {
  Play,
  Zap,
  Flame,
  Trophy,
  Target,
  Calendar,
  Clock,
  Award,
  Shield,
};

export const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/gamification/achievements');
        setAchievements(res.data.data.achievements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto font-mono text-ink space-y-6">
      {/* Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [ACHIEVEMENTS // MILESTONE_REGISTRY]
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              TROPHIES &amp; MILESTONES
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Earn lifetime prestige badges across speed benchmarks, daily cadence, and tournament placements.
            </p>
          </div>
          <Badge variant="accent" size="md">
            {unlockedCount} OF {achievements.length} UNLOCKED
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height="h-36" width="w-full" />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <EmptyState
          title="NO ACHIEVEMENTS REGISTERED"
          description="Milestones are being synchronized with the central prestige cluster."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || Award;
            const isUnlocked = item.unlocked;

            return (
              <div
                key={item.code}
                className={`border p-6 flex flex-col justify-between relative transition-colors ${
                  isUnlocked
                    ? 'border-line bg-surface'
                    : 'border-line/60 bg-bg opacity-65'
                }`}
              >
                {isUnlocked && <CornerMarker position="top-left" size={6} />}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 border flex items-center justify-center ${
                        isUnlocked
                          ? 'border-ink bg-ink text-surface'
                          : 'border-line bg-surface text-ink-muted'
                      }`}
                    >
                      <IconComponent
                        size={18}
                        strokeWidth={1.5}
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        className={isUnlocked ? 'text-accent' : 'text-ink-muted'}
                      />
                    </div>
                    <Badge variant={isUnlocked ? 'ok' : 'outline'} size="sm">
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </Badge>
                  </div>

                  <h3 className="font-display text-sm uppercase font-bold text-ink mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line mt-4 flex items-center justify-between text-[10px] text-ink-muted uppercase">
                  <span>CATEGORY: {item.category}</span>
                  <span>ID: {item.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
