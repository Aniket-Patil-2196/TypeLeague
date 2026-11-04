import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Keyboard,
  Compass,
  Trophy,
  User,
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { path: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard },
  { path: '/arena', label: 'ARENA', icon: Keyboard },
  { path: '/groups', label: 'GROUPS', icon: Compass },
  { path: '/leaderboards', label: 'RANKS', icon: Trophy },
  { path: '/profile', label: 'PROFILE', icon: User },
];

export const MobileTabBar = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-surface border-t border-line grid grid-cols-5 z-40 select-none">
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center border-r border-line last:border-r-0 transition-colors duration-100 ${
              isActive ? 'bg-bg text-ink' : 'text-ink-soft hover:bg-bg hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-[2px] bg-accent"
                  aria-hidden="true"
                />
              )}
              <item.icon
                size={18}
                strokeWidth={1.5}
                strokeLinecap="square"
                strokeLinejoin="miter"
                className={isActive ? 'text-accent' : 'text-ink-soft'}
              />
              <span className="text-[9px] uppercase font-mono tracking-wider mt-1">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
