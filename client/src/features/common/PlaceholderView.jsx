import React from 'react';
import { Cell, EmptyState, Badge, CornerMarker } from '../../components/ui';

export const PlaceholderView = ({
  title = 'MODULE VIEW',
  indexLabel = '[MODULE]',
  phase = 'PHASE 2 / 3',
  description = 'This module will be fully populated in the upcoming phase according to the Master Prompt specification.',
}) => {
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto font-mono text-ink">
      <div className="border border-line bg-surface p-6 mb-6 relative">
        <CornerMarker position="top-left" size={6} />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              {indexLabel}
            </span>
            <h1 className="font-display text-2xl uppercase font-bold text-ink">
              {title}
            </h1>
          </div>
          <Badge variant="outline">{phase}</Badge>
        </div>
      </div>

      <EmptyState
        title={`${title} READY FOR PIPELINE`}
        description={description}
        indexLabel={indexLabel}
      />
    </div>
  );
};
