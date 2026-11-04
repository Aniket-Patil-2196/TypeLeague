import React from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({
  type = 'info', // 'info' | 'success' | 'error'
  title,
  message,
  onClose,
  className = '',
}) => {
  const borderBarClass = {
    info: 'border-l-accent',
    success: 'border-l-ok',
    error: 'border-l-error',
  }[type];

  return (
    <div
      role="alert"
      className={`relative w-full max-w-sm bg-surface border border-line border-l-4 ${borderBarClass} p-4 font-mono ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 text-ink">
            {type === 'success' && (
              <Check size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ok" />
            )}
            {type === 'error' && (
              <AlertTriangle size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-error" />
            )}
            {type === 'info' && (
              <Info size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-accent" />
            )}
          </span>
          <div>
            {title && (
              <h4 className="text-xs uppercase font-medium tracking-wider text-ink">
                {title}
              </h4>
            )}
            <p className="text-xs text-ink-soft leading-relaxed mt-0.5">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1"
            aria-label="Dismiss toast"
          >
            <X size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        )}
      </div>
    </div>
  );
};
