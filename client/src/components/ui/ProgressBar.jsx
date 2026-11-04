import React from 'react';

export const ProgressBar = ({
  value = 0, // 0 to 100
  max = 100,
  variant = 'accent', // 'accent' | 'ink'
  showTicks = true,
  height = 'h-3',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`relative w-full border border-line bg-surface ${height} ${className}`}>
      {/* Fill */}
      <div
        className={`h-full transition-all duration-100 ${
          variant === 'accent' ? 'bg-accent' : 'bg-ink'
        }`}
        style={{ width: `${percentage}%` }}
      />

      {/* Segmented ticks every 10% */}
      {showTicks && (
        <div className="absolute inset-0 flex justify-between pointer-events-none" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tick) => (
            <span
              key={tick}
              className="w-[1px] h-full bg-line/60"
              style={{ left: `${tick * 10}%`, position: 'absolute' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
