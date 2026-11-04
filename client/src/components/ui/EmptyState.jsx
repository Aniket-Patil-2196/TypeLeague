import React from 'react';
import { CropMarkBox } from './CropMarkBox';
import { Button } from './Button';

export const EmptyState = ({
  title = 'NO RECORDS FOUND',
  description = 'There is currently no data recorded for this section.',
  actionLabel,
  onAction,
  indexLabel = '[EMPTY]',
  className = '',
}) => {
  return (
    <CropMarkBox
      inset={10}
      armLength={12}
      className={`border border-line bg-surface p-10 text-center font-mono ${className}`}
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest text-ink-muted mb-2 block">
          {indexLabel}
        </span>
        <h4 className="text-sm uppercase font-semibold tracking-wider text-ink mb-1.5">
          {title}
        </h4>
        <p className="text-xs text-ink-soft leading-relaxed mb-6 max-w-sm">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </CropMarkBox>
  );
};

export const ErrorState = ({
  title = 'EXECUTION FAILURE',
  description = 'An error occurred while communicating with the server.',
  onRetry,
  indexLabel = '[ERR_01]',
  className = '',
}) => {
  return (
    <CropMarkBox
      inset={10}
      armLength={12}
      bracketColor="var(--error)"
      className={`border border-error/50 bg-surface p-10 text-center font-mono ${className}`}
    >
      <div className="max-w-md mx-auto flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest text-error mb-2 block font-medium">
          {indexLabel}
        </span>
        <h4 className="text-sm uppercase font-semibold tracking-wider text-ink mb-1.5">
          {title}
        </h4>
        <p className="text-xs text-ink-soft leading-relaxed mb-6 max-w-sm">
          {description}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            RETRY OPERATION
          </Button>
        )}
      </div>
    </CropMarkBox>
  );
};
