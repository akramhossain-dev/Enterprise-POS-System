'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unexpected exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-slate-100 bg-[#0c1220] rounded-xl border border-slate-900 font-sans text-center max-w-md mx-auto my-12 select-none">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
            Runtime Error Intercepted
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-2 mb-6">
            {this.state.error?.message || 'An unexpected client rendering crash occurred.'}
          </p>
          <Button
            onClick={this.handleReset}
            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-slate-100 font-bold uppercase text-[10px] tracking-wide gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Application</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
