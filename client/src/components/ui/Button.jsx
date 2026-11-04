import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'icon'
  size = 'md', // 'sm' | 'md' | 'lg'
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) => {
  if (variant === 'primary') {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`chamfer-sm group relative inline-flex items-center justify-center font-mono font-medium uppercase text-ink transition-colors duration-100 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${
          size === 'sm' ? 'h-9 px-4 text-xs tracking-wider' : size === 'lg' ? 'h-12 px-8 text-sm tracking-widest' : 'h-11 px-6 text-[13px] tracking-wider'
        } bg-accent hover:bg-accent-press ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-ink inline-block animate-pulse" />
            <span>PROCESSING</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`inline-flex items-center justify-center font-mono font-medium uppercase border border-ink bg-transparent text-ink transition-colors duration-100 hover:bg-ink hover:text-bg active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${
          size === 'sm' ? 'h-9 px-4 text-xs tracking-wider' : size === 'lg' ? 'h-12 px-8 text-sm tracking-widest' : 'h-11 px-6 text-[13px] tracking-wider'
        } ${className}`}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-current inline-block animate-pulse" />
            <span>WAIT</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }

  if (variant === 'tertiary') {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`inline-flex items-center justify-center font-mono uppercase text-ink underline underline-offset-4 hover:text-ink-soft transition-colors duration-100 text-[13px] tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`inline-flex items-center justify-center w-10 h-10 border border-line bg-surface text-ink transition-colors duration-100 hover:bg-ink hover:text-bg active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return null;
};
