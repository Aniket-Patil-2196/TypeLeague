import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CornerMarker } from '../../components/ui/CornerMarker';
import { ArenaPreview } from '../../components/typing/ArenaPreview';
import { LeaderboardPreview } from '../../components/leaderboard/LeaderboardPreview';
import {
  Keyboard,
  Users,
  Calendar,
  Trophy,
  Award,
  BarChart3,
  ArrowRight,
  Terminal,
  Activity,
} from 'lucide-react';

export const LandingPage = () => {
  const [rotatingStat, setRotatingStat] = useState({ stat: '148.2 WPM', label: 'TODAY HIGHEST' });

  useEffect(() => {
    const stats = [
      { stat: '148.2 WPM', label: 'PEAK VELOCITY TODAY' },
      { stat: '99.8%', label: 'PEAK ACCURACY' },
      { stat: '420+', label: 'COMPETITORS ACTIVE' },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % stats.length;
      setRotatingStat(stats[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-ink bg-bg">
      {/* 1. HERO WORDMARK CELL (Clipped display XL) */}
      <section className="border-b border-line bg-surface relative overflow-hidden select-none">
        <CornerMarker position="top-left" size={8} />
        <CornerMarker position="top-right" size={8} />
        <CornerMarker position="bottom-left" size={8} />
        <CornerMarker position="bottom-right" size={8} />

        <div className="py-6 px-4 sm:px-8 border-b border-line flex items-center justify-between text-xs uppercase tracking-widest text-ink-muted">
          <span>[SYSTEM // TL-ARENA-V2]</span>
          <span>COMPETITIVE TYPING INFRASTRUCTURE</span>
        </div>

        {/* Giant Display Headline */}
        <div className="px-4 sm:px-8 py-8 sm:py-12 overflow-hidden">
          <h1 className="font-display font-black text-ink uppercase tracking-tight text-[clamp(44px,11vw,180px)] leading-[0.88] whitespace-nowrap">
            TYPE FASTER.
            <br />
            COMPETE SMARTER.
          </h1>
        </div>

        {/* Stepped Linear Marquee Strip */}
        <div className="border-t border-line bg-ink text-surface py-2.5 overflow-hidden flex whitespace-nowrap text-xs font-mono uppercase tracking-widest select-none">
          <div className="flex gap-12 animate-none">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="flex items-center gap-4">
                <span className="text-accent font-bold">TYPE. COMPETE. CLIMB.</span>
                <span className="text-line-strong">//</span>
                <span>OFFICIAL EVALUATION METRICS</span>
                <span className="text-line-strong">//</span>
                <span>PRECISION BLUEPRINT ARCHITECTURE</span>
                <span className="text-line-strong">//</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SPLIT HERO INTERACTIVE ARENA CELL GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-line">
        {/* Left Column: Mission statement and actions (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-line bg-surface flex flex-col justify-between relative">
          <CornerMarker position="top-left" size={6} />
          <div>
            <div className="inline-block text-xs uppercase tracking-widest text-ink-muted mb-4 border border-line px-2.5 py-1 bg-bg">
              [INDEX // 00_CORE]
            </div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink tracking-tight mb-4 leading-tight">
              A PLATFORM BUILT FOR MECHANICAL PRECISION.
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-8">
              TypeLeague is a community-driven competitive typing platform. Users practise typing,
              compete in global and group-based daily challenges, create private communities, upload custom
              typing content, earn XP, and climb verified leaderboards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  START TYPING NOW
                </Button>
              </Link>
              <Link to="/groups">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  EXPLORE COMMUNITIES
                </Button>
              </Link>
            </div>
          </div>

          {/* Rotating Realtime Telemetry Badge */}
          <div className="mt-10 pt-6 border-t border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent" />
              <div>
                <p className="text-[10px] text-ink-muted uppercase tracking-wider">
                  {rotatingStat.label}
                </p>
                <p className="text-sm font-bold text-ink tabular-nums">
                  {rotatingStat.stat}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-bg border border-line px-2 py-0.5 text-ink-muted">
              SAMPLE DATA
            </span>
          </div>
        </div>

        {/* Right Column: Live Typing Arena Preview (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-bg flex flex-col justify-center">
          <ArenaPreview />
        </div>
      </section>

      {/* 3. PUBLIC COMMUNITIES PARTNER STRIP */}
      <section className="border-b border-line bg-surface px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-wider text-ink-muted select-none">
        <span className="font-semibold text-ink">[FEATURED COMMUNITIES]</span>
        <div className="flex flex-wrap items-center gap-6 text-xs text-ink">
          <span className="hover:text-accent cursor-pointer">CAMPUS CODERS (124 MEMBERS)</span>
          <span className="text-line">/</span>
          <span className="hover:text-accent cursor-pointer">VIM SPEEDRUNNERS (88 MEMBERS)</span>
          <span className="text-line">/</span>
          <span className="hover:text-accent cursor-pointer">FRONTEND DEV GUILD (210 MEMBERS)</span>
        </div>
        <span className="text-[10px] bg-bg border border-line px-2 py-0.5">SAMPLE DATA</span>
      </section>

      {/* 4. FEATURES GRID [01] to [06] */}
      <section className="border-b border-line bg-bg">
        <div className="p-6 sm:p-10 border-b border-line bg-surface flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [01] SYSTEM CAPABILITIES
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
              ENGINEERED FOR RIGOROUS TYPING PRACTICE
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              idx: '[01]',
              title: 'COMPETITIVE TYPING',
              desc: 'High-precision typing engine calculating Net WPM, raw speed, accuracy, and keystroke rhythm.',
              icon: Keyboard,
            },
            {
              idx: '[02]',
              title: 'PRIVATE COMMUNITIES',
              desc: 'Create invite-only or public groups with custom roles, moderator controls, and member management.',
              icon: Users,
            },
            {
              idx: '[03]',
              title: 'DAILY CHALLENGES',
              desc: 'One official synchronized competition per group per calendar dateKey with attempt limits.',
              icon: Calendar,
            },
            {
              idx: '[04]',
              title: 'GLOBAL LEADERBOARDS',
              desc: 'Verified unrounded scoring rankings with tie-break logic across daily, weekly, and monthly periods.',
              icon: Trophy,
            },
            {
              idx: '[05]',
              title: 'XP AND ACHIEVEMENTS',
              desc: 'Idempotent point transaction ledger, leveling progressions, and unlockable achievement milestones.',
              icon: Award,
            },
            {
              idx: '[06]',
              title: 'PERFORMANCE ANALYTICS',
              desc: 'Comprehensive historical telemetry, velocity trends over time, and group participation metrics.',
              icon: BarChart3,
            },
          ].map((feat) => (
            <div
              key={feat.idx}
              className="p-8 border-b md:border-r border-line bg-surface hover:bg-bg transition-colors duration-100 relative group flex flex-col justify-between h-64"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-ink-muted group-hover:text-ink font-bold">
                  {feat.idx}
                </span>
                <feat.icon
                  size={20}
                  strokeWidth={1.5}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className="text-ink group-hover:text-accent transition-colors"
                />
              </div>
              <div>
                <h3 className="font-display text-lg uppercase font-bold text-ink mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">{feat.desc}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CornerMarker position="top-left" size={6} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (01, 02, 03) */}
      <section className="border-b border-line bg-surface">
        <div className="p-6 sm:p-10 border-b border-line flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              SEC 02 / PROTOCOL WORKFLOW
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
              HOW TYPELEAGUE OPERATES
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'JOIN OR CREATE A COMMUNITY',
              desc: 'Establish a custom workspace for your university batch, company department, or open competitive typing clan.',
            },
            {
              step: '02',
              title: 'TAKE THE DAILY CHALLENGE',
              desc: 'Compete on synchronized typing content with strict server-side validation and anti-cheat timestamps.',
            },
            {
              step: '03',
              title: 'EARN POINTS & CLIMB RANKS',
              desc: 'Secure points, advance through prestige levels, and claim your place atop the stepped podium.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-8 sm:p-10 border-b md:border-b-0 md:border-r border-line last:border-r-0 bg-bg relative"
            >
              <span className="font-display font-black text-5xl sm:text-6xl text-ink-muted/50 block mb-4">
                {item.step}
              </span>
              <h3 className="font-display text-base uppercase font-bold text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LEADERBOARD PREVIEW SECTION */}
      <section className="p-6 sm:p-12 border-b border-line bg-bg">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              SEC 03 / LIVE COMPETITIVE BENCHMARK
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
              GLOBAL STANDINGS PREVIEW
            </h2>
          </div>
          <LeaderboardPreview isSample={true} />
        </div>
      </section>

      {/* 7. FINAL FULL-WIDTH CTA CELL */}
      <section className="border-b border-line bg-surface p-12 sm:p-20 text-center relative overflow-hidden">
        <CornerMarker position="top-left" size={8} />
        <CornerMarker position="top-right" size={8} />
        <CornerMarker position="bottom-left" size={8} />
        <CornerMarker position="bottom-right" size={8} />

        <div className="max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-ink-muted block mb-3">
            [DEPLOYMENT READY]
          </span>
          <h2 className="font-display text-3xl sm:text-5xl uppercase font-bold tracking-tight text-ink mb-6">
            READY TO PROVE YOUR TYPING SPEED?
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-8 max-w-xl mx-auto">
            Create an account, enter today’s global typing arena, and establish your verified
            benchmark score on the global leaderboard.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg">
                GET STARTED &middot; CREATE ACCOUNT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER GRID CELL */}
      <footer className="bg-surface text-ink text-xs font-mono">
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-line">
          <div className="p-8 border-b md:border-b-0 md:border-r border-line">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-ink flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-accent" />
              </div>
              <span className="font-display font-bold uppercase text-sm">TYPELEAGUE</span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Precision competitive typing infrastructure. MERN stack with technical blueprint grid
              interface.
            </p>
          </div>

          <div className="p-8 border-b md:border-b-0 md:border-r border-line">
            <h4 className="text-xs uppercase font-bold text-ink mb-4 tracking-wider">PLATFORM</h4>
            <ul className="space-y-2 text-ink-soft">
              <li><Link to="/arena" className="hover:text-ink">Global Arena</Link></li>
              <li><Link to="/groups" className="hover:text-ink">Explore Communities</Link></li>
              <li><Link to="/leaderboards" className="hover:text-ink">Leaderboards</Link></li>
              <li><Link to="/dev/ui" className="hover:text-ink">Design System Kit</Link></li>
            </ul>
          </div>

          <div className="p-8 border-b md:border-b-0 md:border-r border-line">
            <h4 className="text-xs uppercase font-bold text-ink mb-4 tracking-wider">DOCUMENTATION</h4>
            <ul className="space-y-2 text-ink-soft">
              <li><a href="#rules" className="hover:text-ink">Scoring Engine Spec</a></li>
              <li><a href="#integrity" className="hover:text-ink">Verification Protocol</a></li>
              <li><a href="#terms" className="hover:text-ink">Acceptable Use Policy</a></li>
            </ul>
          </div>

          <div className="p-8">
            <h4 className="text-xs uppercase font-bold text-ink mb-4 tracking-wider">SYSTEM STATUS</h4>
            <div className="flex items-center gap-2 mb-2 text-ok font-medium">
              <span className="w-2 h-2 bg-ok" />
              <span>CLUSTER OPERATIONAL</span>
            </div>
            <p className="text-[11px] text-ink-muted">VERSION 1.0.0 &middot; BUILD 20261104</p>
          </div>
        </div>

        <div className="p-4 px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-muted">
          <span>&copy; {new Date().getFullYear()} TYPELEAGUE. ALL RIGHTS RESERVED.</span>
          <span>STRICT SPECIFICATION COMPLIANCE</span>
        </div>
      </footer>
    </div>
  );
};
