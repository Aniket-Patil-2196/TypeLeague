import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'neutral' | 'accent' | 'ok' | 'error' | 'outline'
  size = 'md', // 'sm' | 'md'
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-surface text-ink border-line',
    accent: 'bg-accent text-ink border-accent font-medium',
    ok: 'bg-surface text-ok border-ok',
    error: 'bg-surface text-error border-error',
    outline: 'bg-transparent text-ink border-ink',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-widest',
  };

  return (
    <span
      className={`inline-flex items-center font-mono uppercase border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
