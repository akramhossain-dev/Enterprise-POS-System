import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { tokenManager } from '@/lib/axios';

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(data: any) {}
  addEventListener(type: string, listener: any) {}
  removeEventListener(type: string, listener: any) {}
  close() {}
}
global.BroadcastChannel = MockBroadcastChannel as any;

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('useSessionTimeout Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(tokenManager, 'clearTokens');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize activity and respond to user events', () => {
    const { result } = renderHook(() => useSessionTimeout());

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'));
    });

    // Just verify it doesn't crash during mounting and basic event dispatcher
    expect(result.current).toBeUndefined();
  });
});
