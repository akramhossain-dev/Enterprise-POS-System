'use client';

import { Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ChartSkeleton } from './chart-skeleton';

// ── Error Boundary ────────────────────────────────────────────────────────
interface ChartErrorBoundaryProps {
  children: ReactNode;
  height?: number;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  override state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[ChartErrorBoundary]', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-lg bg-muted/50 border border-border"
          style={{ height: this.props.height ?? 240 }}
        >
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chart failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Chart Wrapper ─────────────────────────────────────────────────────────
interface ChartWrapperProps {
  children: ReactNode;
  height?: number;
  loading?: boolean;
  className?: string;
}

export function ChartWrapper({ children, height = 240, loading, className }: ChartWrapperProps) {
  if (loading) return <ChartSkeleton height={height} className={className} />;

  return (
    <ChartErrorBoundary height={height}>
      <Suspense fallback={<ChartSkeleton height={height} className={className} />}>
        <div className={className} style={{ height }}>
          {children}
        </div>
      </Suspense>
    </ChartErrorBoundary>
  );
}
