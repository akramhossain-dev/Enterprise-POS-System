'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-rose-950/90 text-rose-200 border-b border-rose-900/40 text-xs py-2 px-4 flex items-center justify-between font-sans select-none print:hidden">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-rose-500 animate-pulse" />
        <span>You are currently offline. POS sync operations are temporarily cached locally.</span>
      </div>
      <Button
        size="sm"
        onClick={() => window.location.reload()}
        className="h-6 px-2.5 bg-rose-900 hover:bg-rose-800 text-rose-100 font-bold uppercase text-[9px] gap-1"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Retry Connection</span>
      </Button>
    </div>
  );
}
export default OfflineBanner;
