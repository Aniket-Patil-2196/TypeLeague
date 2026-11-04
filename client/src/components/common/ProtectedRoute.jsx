import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Skeleton } from '../ui/Skeleton';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="p-12 max-w-4xl mx-auto space-y-4 font-mono">
        <div className="text-xs uppercase tracking-widest text-ink-muted">
          VERIFYING SESSION CREDENTIALS...
        </div>
        <Skeleton height="h-8" width="w-1/3" />
        <Skeleton height="h-24" width="w-full" />
        <Skeleton height="h-48" width="w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
