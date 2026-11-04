import React from 'react';
import { Button } from '../ui/Button';
import { CornerMarker } from '../ui/CornerMarker';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-ink p-8 flex items-center justify-center font-mono select-none">
          <div className="max-w-xl w-full border border-line bg-surface p-8 relative space-y-6">
            <CornerMarker position="top-left" size={8} />
            <div className="border-b border-line pb-4">
              <span className="text-[10px] uppercase tracking-widest text-error block mb-1">
                [SYS_EXCEPTION // RUNTIME_INTERCEPT]
              </span>
              <h2 className="font-display text-2xl uppercase font-bold text-ink">
                APPLICATION RUNTIME EXCEPTION
              </h2>
            </div>

            <div className="p-4 bg-panel text-surface border border-panel-line text-xs font-mono break-all">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
              >
                RELOAD VIEW
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleReset}
              >
                RETURN TO DASHBOARD
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
