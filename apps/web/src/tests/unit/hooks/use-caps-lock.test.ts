import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCapsLock } from '@/hooks/use-caps-lock';

describe('useCapsLock Hook', () => {
  it('should initialize to false', () => {
    const { result } = renderHook(() => useCapsLock());
    expect(result.current).toBe(false);
  });

  it('should detect when CapsLock is active on keydown', () => {
    const { result } = renderHook(() => useCapsLock());

    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
    });
    // Mock getModifierState
    Object.defineProperty(event, 'getModifierState', {
      value: (modifier: string) => modifier === 'CapsLock',
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current).toBe(true);
  });
});
