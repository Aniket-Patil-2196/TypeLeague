import React from 'react';

export const CropMarkBox = ({
  children,
  className = '',
  bracketColor = 'var(--line)',
  armLength = 12,
  inset = 8,
  ...props
}) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {/* Top Left Bracket */}
      <span
        className="absolute pointer-events-none"
        style={{
          top: `${inset}px`,
          left: `${inset}px`,
          width: `${armLength}px`,
          height: `${armLength}px`,
          borderTop: `1px solid ${bracketColor}`,
          borderLeft: `1px solid ${bracketColor}`,
        }}
        aria-hidden="true"
      />

      {/* Top Right Bracket */}
      <span
        className="absolute pointer-events-none"
        style={{
          top: `${inset}px`,
          right: `${inset}px`,
          width: `${armLength}px`,
          height: `${armLength}px`,
          borderTop: `1px solid ${bracketColor}`,
          borderRight: `1px solid ${bracketColor}`,
        }}
        aria-hidden="true"
      />

      {/* Bottom Left Bracket */}
      <span
        className="absolute pointer-events-none"
        style={{
          bottom: `${inset}px`,
          left: `${inset}px`,
          width: `${armLength}px`,
          height: `${armLength}px`,
          borderBottom: `1px solid ${bracketColor}`,
          borderLeft: `1px solid ${bracketColor}`,
        }}
        aria-hidden="true"
      />

      {/* Bottom Right Bracket */}
      <span
        className="absolute pointer-events-none"
        style={{
          bottom: `${inset}px`,
          right: `${inset}px`,
          width: `${armLength}px`,
          height: `${armLength}px`,
          borderBottom: `1px solid ${bracketColor}`,
          borderRight: `1px solid ${bracketColor}`,
        }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
};
