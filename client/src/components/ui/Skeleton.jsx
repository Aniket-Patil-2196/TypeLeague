import React from 'react';

export const Skeleton = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
}) => {
  return (
    <div
      className={`bg-line/40 animate-pulse ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
};
