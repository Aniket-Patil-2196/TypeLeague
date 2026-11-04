import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Bell, LogOut, User, Menu, X, Check } from 'lucide-react';

export const TopBar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => setNotifications(res.data.data.notifications || []))
        .catch(() => {});
    }
  }, [isAuthenticated, showNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="h-[72px] bg-surface border-b border-line flex items-stretch justify-between relative z-40 select-none">
      {/* Left: Mobile Toggle & Logo Cell */}
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden w-[72px] border-r border-line flex items-center justify-center text-ink hover:bg-bg"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          ) : (
            <Menu size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          )}
        </button>

        <Link
          to="/"
          className="flex items-center gap-3 px-6 border-r border-line hover:bg-bg transition-colors duration-100"
        >
          {/* Logo Mark: Square inside square with accent center */}
          <div className="w-8 h-8 bg-ink flex items-center justify-center p-1">
            <div className="w-full h-full bg-accent flex items-center justify-center">
              <div className="w-2 h-2 bg-ink" />
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-ink uppercase">
            TYPELEAGUE
          </span>
        </Link>
      </div>

      {/* Center: Quick Breadcrumb / Platform Title (Desktop) */}
      <div className="hidden lg:flex items-center px-6 text-xs uppercase tracking-widest text-ink-muted">
        <span>GRID / SYSTEM 01</span>
      </div>

      {/* Right: Actions and User Cell */}
      <div className="flex items-stretch">
        {isAuthenticated ? (
          <>
            {/* Notification Cell */}
            <div className="relative border-l border-line flex items-center justify-center w-[72px]">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="w-full h-full flex items-center justify-center hover:bg-bg transition-colors duration-100"
                aria-label="Toggle notifications"
              >
                <div className="relative">
                  <Bell size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent" />}
                </div>
              </button>

              {/* Square Notification Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-[72px] w-80 bg-surface border border-line border-t-0 p-3 font-mono z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-line mb-2">
                    <span className="text-xs uppercase font-bold text-ink">NOTIFICATIONS ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[10px] uppercase text-accent hover:underline"
                      >
                        MARK ALL READ
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-ink-muted text-center py-4">No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2 border text-xs ${
                            n.isRead ? 'border-line/60 bg-bg text-ink-muted' : 'border-line bg-surface text-ink'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px] uppercase mb-0.5">
                            <span>{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 bg-accent inline-block" />}
                          </div>
                          <p className="text-[11px] text-ink-soft leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Cell */}
            <div className="relative border-l border-line">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-full px-5 flex items-center gap-3 hover:bg-bg transition-colors duration-100 font-mono"
              >
                <Avatar name={user?.fullName || user?.username} size={32} />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs uppercase font-medium text-ink tracking-wider">
                    {user?.username}
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase">
                    LVL {user?.level || 1} &middot; {user?.xp || 0} XP
                  </span>
                </div>
              </button>

              {/* Square User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-[72px] w-56 bg-surface border border-line border-t-0 p-2 font-mono z-50">
                  <div className="p-2 border-b border-line mb-1">
                    <p className="text-xs uppercase font-semibold text-ink">{user?.fullName}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs uppercase tracking-wider text-ink hover:bg-bg transition-colors duration-100"
                  >
                    <User size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                    <span>MY PROFILE</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs uppercase tracking-wider text-error hover:bg-bg transition-colors duration-100"
                  >
                    <LogOut size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                    <span>DISCONNECT</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-stretch border-l border-line font-mono">
            <Link
              to="/login"
              className="px-6 flex items-center text-xs uppercase tracking-widest text-ink hover:bg-bg transition-colors duration-100 border-r border-line font-medium"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              className="px-6 flex items-center text-xs uppercase tracking-widest bg-accent text-ink hover:bg-accent-press transition-colors duration-100 font-medium"
            >
              REGISTER
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
