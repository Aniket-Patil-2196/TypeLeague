import React from 'react';
import { NavLink } from 'react-router-dom';
import { CornerMarker } from '../ui/CornerMarker';
import {
  LayoutDashboard,
  Keyboard,
  Compass,
  Users,
  Trophy,
  Award,
  User,
  Settings,
  Code,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard },
  { path: '/arena', label: 'GLOBAL ARENA', icon: Keyboard },
  { path: '/groups', label: 'EXPLORE GROUPS', icon: Compass },
  { path: '/my-groups', label: 'MY GROUPS', icon: Users },
  { path: '/leaderboards', label: 'LEADERBOARDS', icon: Trophy },
  { path: '/achievements', label: 'ACHIEVEMENTS', icon: Award },
  { path: '/profile', label: 'MY PROFILE', icon: User },
  { path: '/settings', label: 'SETTINGS', icon: Settings },
  { path: '/dev/ui', label: 'DEV UI KIT', icon: Code },
];

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Flat Overlay (60% ink) */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-ink/60 z-40 transition-none"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-surface border-r border-line flex flex-col justify-between font-mono select-none z-40 transition-transform duration-100 ${
          isMobileOpen ? 'fixed inset-y-0 left-0 pt-[72px] translate-x-0' : 'hidden md:flex'
        }`}
      >
        <div className="flex flex-col">
          <div className="p-4 border-b border-line text-[11px] uppercase tracking-widest text-ink-muted">
            <span>[NAV] MAIN INDEX</span>
          </div>

          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `relative flex items-center gap-3.5 px-5 py-3.5 text-xs uppercase tracking-wider border-b border-line transition-colors duration-100 ${
                    isActive
                      ? 'bg-bg text-ink font-semibold'
                      : 'text-ink-soft hover:bg-bg hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <>
                        <span
                          className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent"
                          aria-hidden="true"
                        />
                        <CornerMarker position="top-left" size={6} />
                      </>
                    )}
                    <item.icon
                      size={18}
                      strokeWidth={1.5}
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      className={isActive ? 'text-accent' : 'text-ink-soft'}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Cell */}
        <div className="p-4 border-t border-line text-[10px] uppercase tracking-widest text-ink-muted bg-surface">
          <div className="flex items-center justify-between mb-1">
            <span>PROTOCOL</span>
            <span className="text-ink">MERN.GRID.V2</span>
          </div>
          <div>STATUS: OPERATIONAL</div>
        </div>
      </aside>
    </>
  );
};
