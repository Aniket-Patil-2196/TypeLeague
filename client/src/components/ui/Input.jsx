import React, { useState } from 'react';
import { CornerMarker } from './CornerMarker';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      id,
      className = '',
      type = 'text',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-mono">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium"
          >
            {label}
            {required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {isFocused && <CornerMarker position="top-left" size={6} />}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full h-11 px-3.5 bg-surface text-ink text-sm font-mono placeholder:text-ink-muted border transition-none disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-error' : 'border-line focus:border-ink'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-error font-mono tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      id,
      className = '',
      rows = 4,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-mono">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium"
          >
            {label}
            {required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {isFocused && <CornerMarker position="top-left" size={6} />}
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full p-3.5 bg-surface text-ink text-sm font-mono placeholder:text-ink-muted border transition-none resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-error' : 'border-line focus:border-ink'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-error font-mono tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      id,
      options = [],
      className = '',
      required = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-mono">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium"
          >
            {label}
            {required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {isFocused && <CornerMarker position="top-left" size={6} />}
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full h-11 px-3.5 bg-surface text-ink text-sm font-mono border transition-none disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-error' : 'border-line focus:border-ink'
            } ${className}`}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-error font-mono tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
