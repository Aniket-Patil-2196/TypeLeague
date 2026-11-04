import React from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 40,
  className = '',
  border = true,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      className={`inline-flex items-center justify-center bg-surface text-ink font-mono font-medium select-none ${
        border ? 'border border-line' : ''
      } ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover filter grayscale"
        />
      ) : (
        <span className="text-xs tracking-wider">{initials}</span>
      )}
    </div>
  );
};
