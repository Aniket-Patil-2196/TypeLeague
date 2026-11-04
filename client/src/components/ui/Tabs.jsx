import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex border-b border-line font-mono text-xs uppercase tracking-wider overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-3 border-r border-line last:border-r-0 transition-colors duration-100 flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'bg-surface text-ink font-medium'
                : 'bg-transparent text-ink-soft hover:bg-surface hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-accent text-ink' : 'bg-line text-ink-soft'}`}>
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
