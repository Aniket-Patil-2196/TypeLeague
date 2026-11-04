import React from 'react';

export const CornerMarker = ({
  position = 'top-left', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size = 6, // 6 or 8px
  className = '',
}) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <span
      className={`absolute ${positionClasses[position]} bg-accent pointer-events-none z-10 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    />
  );
};
