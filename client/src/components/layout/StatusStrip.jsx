import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const StatusStrip = () => {
  const [status, setStatus] = useState('CHECKING');
  const [timeString, setTimeString] = useState('');
  const timezone = 'Asia/Kolkata';
  const version = 'v1.0.0';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setTimeString(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    const checkServer = async () => {
      try {
        await api.get('/health');
        setStatus('CONNECTED');
      } catch (err) {
        setStatus('STANDALONE');
      }
    };

    checkServer();
    const healthTimer = setInterval(checkServer, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(healthTimer);
    };
  }, []);

  return (
    <footer className="h-[28px] bg-surface border-t border-line px-4 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-ink-muted select-none z-30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 ${
              status === 'CONNECTED' ? 'bg-ok' : status === 'CHECKING' ? 'bg-accent' : 'bg-error'
            }`}
            aria-hidden="true"
          />
          <span className="text-ink font-medium">SYS: {status}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span>TZ:</span>
          <span className="text-ink">{timezone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>SRV TIME:</span>
          <span className="text-ink font-mono tabular-nums">{timeString || 'SYNCING...'}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ink font-medium">TYPELEAGUE {version}</span>
      </div>
    </footer>
  );
};
