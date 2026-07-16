import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/tests/utils';
import { OfflineBanner } from '@/components/common/offline-banner';

describe('OfflineBanner', () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');

  function setOnlineStatus(isOnline: boolean) {
    Object.defineProperty(window.navigator, 'onLine', {
      value: isOnline,
      configurable: true,
      writable: true,
    });
  }

  afterEach(() => {
    // Restore original onLine
    if (originalOnLine) {
      Object.defineProperty(window.navigator, 'onLine', originalOnLine);
    }
  });

  it('renders nothing when browser is online', () => {
    setOnlineStatus(true);
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the offline banner when browser is offline', () => {
    setOnlineStatus(false);
    render(<OfflineBanner />);
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
  });

  it('renders a Retry Connection button when offline', () => {
    setOnlineStatus(false);
    render(<OfflineBanner />);
    expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
  });

  it('shows the offline banner after "offline" event fires', () => {
    setOnlineStatus(true);
    render(<OfflineBanner />);

    // Simulate going offline
    setOnlineStatus(false);
    fireEvent(window, new Event('offline'));

    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
  });

  it('hides the banner after "online" event fires', () => {
    setOnlineStatus(false);
    render(<OfflineBanner />);

    // Should be visible initially
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();

    // Simulate coming back online
    setOnlineStatus(true);
    fireEvent(window, new Event('online'));

    expect(screen.queryByText(/You are currently offline/i)).not.toBeInTheDocument();
  });
});
