import React from 'react';

/**
 * ChamferBox: Provides a border around a chamfer-cut element by using
 * an outer container with the border background color, 1px padding,
 * and matching clip-path on both outer and inner elements.
 */
export const ChamferBox = ({
  children,
  size = 'sm', // 'sm' (8px) | 'md' (12px) | 'header' (20px bottom)
  borderColor = 'var(--line-strong)',
  backgroundColor = 'var(--surface)',
  className = '',
  innerClassName = '',
  ...props
}) => {
  const chamferClass = size === 'header' 
    ? 'chamfer-header' 
    : size === 'md' 
    ? 'chamfer-md' 
    : 'chamfer-sm';

  return (
    <div
      className={`inline-block ${chamferClass} ${className}`}
      style={{ backgroundColor: borderColor, padding: '1px' }}
      {...props}
    >
      <div
        className={`${chamferClass} ${innerClassName}`}
        style={{ backgroundColor }}
      >
        {children}
      </div>
    </div>
  );
};
