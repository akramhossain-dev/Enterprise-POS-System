import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'hello' },
    });

    expect(result.current).toBe('hello');

    // Update the value prop
    rerender({ val: 'world' });

    // Value should still be 'hello' immediately after update
    expect(result.current).toBe('hello');

    // Advance timer slightly, but less than delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('hello');

    // Advance timer past the delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('world');
  });
});
