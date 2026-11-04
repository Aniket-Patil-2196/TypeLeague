import React from 'react';

export const Checkbox = ({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <span
        className={`w-4 h-4 border flex items-center justify-center transition-none ${
          checked ? 'bg-ink border-ink text-surface' : 'bg-surface border-line'
        }`}
        aria-hidden="true"
      >
        {checked && <span className="w-2 h-2 bg-accent inline-block" />}
      </span>
      {label && <span className="text-ink">{label}</span>}
    </label>
  );
};

export const Radio = ({
  id,
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <span
        className={`w-4 h-4 border flex items-center justify-center ${
          checked ? 'border-ink bg-surface' : 'border-line bg-surface'
        }`}
        aria-hidden="true"
      >
        {checked && <span className="w-2 h-2 bg-ink inline-block" />}
      </span>
      {label && <span className="text-ink">{label}</span>}
    </label>
  );
};

export const Toggle = ({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-3 font-mono text-xs uppercase tracking-wider cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <span
        className={`relative inline-flex w-10 h-5 border border-line transition-none ${
          checked ? 'bg-ink' : 'bg-surface'
        }`}
        aria-hidden="true"
      >
        <span
          className={`w-4 h-4 transition-transform duration-100 ${
            checked ? 'translate-x-5 bg-accent' : 'translate-x-0 bg-ink-muted'
          }`}
        />
      </span>
      {label && <span className="text-ink">{label}</span>}
    </label>
  );
};
