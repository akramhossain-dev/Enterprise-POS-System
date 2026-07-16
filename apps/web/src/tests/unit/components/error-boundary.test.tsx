import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/tests/utils';
import { ErrorBoundary } from '@/components/common/error-boundary';

// Component that intentionally throws a render error
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render crash');
  }
  return <span>Rendered Successfully</span>;
}

describe('ErrorBoundary', () => {
  // Suppress React's error logging for intentional throw tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Rendered Successfully')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Runtime Error Intercepted/i)).toBeInTheDocument();
    expect(screen.getByText(/Test render crash/i)).toBeInTheDocument();
  });

  it('renders a custom fallback when provided and a child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText(/Runtime Error Intercepted/i)).not.toBeInTheDocument();
  });

  it('renders a Reload Application button in the default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /Reload Application/i })).toBeInTheDocument();
  });
});
