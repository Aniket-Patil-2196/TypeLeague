import React, { useState } from 'react';
import { CornerMarker } from './CornerMarker';

export const Cell = ({
  children,
  surface = false,
  interactive = false,
  cornerMarker = false,
  indexLabel,
  title,
  className = '',
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative border border-line ${
        surface ? 'bg-surface' : 'bg-bg'
      } ${
        interactive
          ? 'cursor-pointer hover:border-ink transition-colors duration-100'
          : ''
      } ${className}`}
      {...props}
    >
      {(cornerMarker || (interactive && isHovered)) && (
        <CornerMarker position="top-left" size={6} />
      )}

      {(indexLabel || title) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-surface">
          <div className="flex items-center gap-2">
            {indexLabel && (
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                {indexLabel}
              </span>
            )}
            {title && (
              <h3 className="font-mono text-xs uppercase tracking-widest font-medium text-ink">
                {title}
              </h3>
            )}
          </div>
        </div>
      )}

      <div className="p-6">{children}</div>
    </div>
  );
};
