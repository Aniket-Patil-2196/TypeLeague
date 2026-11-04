import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <div className="border-b border-line bg-surface px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink-muted flex items-center gap-2 overflow-x-auto select-none">
      <Link to="/" className="hover:text-ink transition-colors duration-100">
        ROOT
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={routeTo}>
            <span className="text-line-strong">/</span>
            {isLast ? (
              <span className="text-ink font-medium">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-ink transition-colors duration-100">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
