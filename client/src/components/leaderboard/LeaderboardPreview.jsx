import React from 'react';
import { Avatar } from '../ui/Avatar';
import { CornerMarker } from '../ui/CornerMarker';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const SAMPLE_LEADERBOARD = [
  { rank: 1, name: 'Vortex_99', wpm: 148.2, accuracy: 99.8, score: 147.9, xp: 100, delta: 0 },
  { rank: 2, name: 'NullPointer', wpm: 139.5, accuracy: 99.1, score: 138.2, xp: 75, delta: 2 },
  { rank: 3, name: 'ByteRacer', wpm: 134.0, accuracy: 98.6, score: 132.1, xp: 50, delta: -1 },
  { rank: 4, name: 'SyntaxGhost', wpm: 126.4, accuracy: 97.9, score: 123.7, xp: 25, delta: 1 },
  { rank: 5, name: 'Aniket_S', wpm: 121.0, accuracy: 98.4, score: 119.0, xp: 25, delta: 0, isCurrentUser: true },
];

export const LeaderboardPreview = ({ isSample = true }) => {
  const top1 = SAMPLE_LEADERBOARD[0];
  const top2 = SAMPLE_LEADERBOARD[1];
  const top3 = SAMPLE_LEADERBOARD[2];

  return (
    <div className="font-mono text-ink">
      {/* Sample Data Badge if applicable */}
      {isSample && (
        <div className="flex items-center justify-between border-b border-line pb-3 mb-6">
          <span className="text-xs uppercase tracking-widest text-ink-muted">
            [LEADERBOARD_01] GLOBAL TOP CONTENDERS
          </span>
          <span className="text-[11px] uppercase tracking-wider bg-ink text-surface px-2 py-0.5">
            SAMPLE DATA
          </span>
        </div>
      )}

      {/* Stepped Podium (2nd, 1st, 3rd) */}
      <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 mb-4">
        {/* 2nd Place: Ink Fill, BG Text */}
        <div className="bg-ink text-bg border border-ink p-4 flex flex-col justify-between h-48 sm:h-56 relative select-none">
          <div className="flex items-start justify-between">
            <span className="font-display font-black text-3xl sm:text-4xl text-bg leading-none">
              02
            </span>
            <Avatar name={top2.name} size={36} border={false} className="bg-bg text-ink" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold truncate text-bg">{top2.name}</p>
            <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
              {top2.wpm} WPM &middot; {top2.accuracy}%
            </p>
            <p className="text-sm font-bold text-accent tabular-nums mt-1">{top2.score} PTS</p>
          </div>
        </div>

        {/* 1st Place: Tallest, Accent Fill, Ink Text */}
        <div className="bg-accent text-ink border border-accent p-4 sm:p-5 flex flex-col justify-between h-56 sm:h-64 relative select-none">
          <CornerMarker position="top-left" size={8} className="bg-ink" />
          <CornerMarker position="top-right" size={8} className="bg-ink" />
          <div className="flex items-start justify-between">
            <span className="font-display font-black text-4xl sm:text-5xl text-ink leading-none">
              01
            </span>
            <Avatar name={top1.name} size={42} border={false} className="bg-ink text-surface" />
          </div>
          <div>
            <div className="inline-block bg-ink text-accent text-[9px] uppercase px-1.5 py-0.5 font-bold mb-1">
              CHAMPION
            </div>
            <p className="text-sm uppercase font-bold truncate text-ink">{top1.name}</p>
            <p className="text-xs text-ink/80 tabular-nums mt-0.5 font-medium">
              {top1.wpm} WPM &middot; {top1.accuracy}%
            </p>
            <p className="text-base font-black text-ink tabular-nums mt-1">{top1.score} PTS</p>
          </div>
        </div>

        {/* 3rd Place: Transparent with 1px ink border */}
        <div className="bg-surface text-ink border border-ink p-4 flex flex-col justify-between h-40 sm:h-48 relative select-none">
          <div className="flex items-start justify-between">
            <span className="font-display font-black text-2xl sm:text-3xl text-ink leading-none">
              03
            </span>
            <Avatar name={top3.name} size={32} />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold truncate text-ink">{top3.name}</p>
            <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
              {top3.wpm} WPM &middot; {top3.accuracy}%
            </p>
            <p className="text-sm font-bold text-ink tabular-nums mt-1">{top3.score} PTS</p>
          </div>
        </div>
      </div>

      {/* Podium Base Strip */}
      <div className="h-4 bg-panel border border-panel-line w-full mb-8 flex items-center justify-between px-3">
        <span className="text-[9px] uppercase font-mono tracking-widest text-ink-muted">PODIUM BASE // OFFICIAL STANDINGS</span>
        <span className="text-[9px] font-mono text-accent">TOP 3 PODIUM</span>
      </div>

      {/* Grid-lined Leaderboard Table */}
      <div className="border border-line overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-surface border-b border-line text-ink-muted uppercase tracking-wider text-left">
              <th className="p-3 border-r border-line w-16 text-center">RANK</th>
              <th className="p-3 border-r border-line">CONTENDER</th>
              <th className="p-3 border-r border-line text-right">NET WPM</th>
              <th className="p-3 border-r border-line text-right">ACCURACY</th>
              <th className="p-3 border-r border-line text-right">SCORE</th>
              <th className="p-3 border-r border-line text-center">DELTA</th>
              <th className="p-3 text-right">XP</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_LEADERBOARD.map((row) => (
              <tr
                key={row.rank}
                className={`border-b border-line last:border-b-0 hover:bg-surface transition-colors duration-100 ${
                  row.isCurrentUser ? 'bg-surface relative' : ''
                }`}
              >
                <td className="p-3 border-r border-line text-center tabular-nums font-semibold relative">
                  {row.isCurrentUser && (
                    <>
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
                      <CornerMarker position="top-left" size={4} />
                    </>
                  )}
                  {String(row.rank).padStart(2, '0')}
                </td>
                <td className="p-3 border-r border-line flex items-center gap-3">
                  <Avatar name={row.name} size={26} />
                  <span className={`uppercase font-medium ${row.isCurrentUser ? 'text-accent font-bold' : 'text-ink'}`}>
                    {row.name} {row.isCurrentUser && '(YOU)'}
                  </span>
                </td>
                <td className="p-3 border-r border-line text-right tabular-nums font-medium">
                  {row.wpm.toFixed(1)}
                </td>
                <td className="p-3 border-r border-line text-right tabular-nums">
                  {row.accuracy.toFixed(1)}%
                </td>
                <td className="p-3 border-r border-line text-right tabular-nums font-bold text-ink">
                  {row.score.toFixed(1)}
                </td>
                <td className="p-3 border-r border-line text-center">
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
                <td className="p-3 text-right tabular-nums font-medium text-ink-soft">
                  +{row.xp} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
