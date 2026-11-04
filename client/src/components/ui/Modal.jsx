import React, { useEffect } from 'react';
import { CornerMarker } from './CornerMarker';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  indexLabel,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Flat 60% ink overlay */}
      <div
        className="fixed inset-0 bg-ink/60 transition-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidth} bg-bg border border-ink font-mono`}
      >
        <CornerMarker position="top-left" size={6} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface">
          <div className="flex items-center gap-2">
            {indexLabel && (
              <span className="text-xs uppercase tracking-wider text-ink-muted">
                {indexLabel}
              </span>
            )}
            {title && (
              <h2 className="text-xs uppercase tracking-widest font-medium text-ink">
                {title}
              </h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-ink hover:bg-ink hover:text-bg transition-colors duration-100"
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
