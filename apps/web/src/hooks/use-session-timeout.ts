'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { tokenManager } from '@/lib/axios';
import { authConfig } from '@/config/auth';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes

export function useSessionTimeout() {
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const warnToastShownRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('epos-session');

    const handleSessionMessage = (event: MessageEvent) => {
      if (event.data === 'logout') {
        tokenManager.clearTokens();
        toast.info('Session ended on another tab. Logging out.');
        router.push(authConfig.routes.login);
      }
    };
    channel.addEventListener('message', handleSessionMessage);

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      warnToastShownRef.current = false;
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        tokenManager.clearTokens();
        channel.postMessage('logout');
        toast.error('Session expired due to inactivity.');
        router.push(authConfig.routes.login);
      } else if (elapsed >= WARNING_TIMEOUT_MS && !warnToastShownRef.current) {
        warnToastShownRef.current = true;
        toast.warning('Your session will expire in 1 minute due to inactivity.', {
          duration: 10000,
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearInterval(interval);
      channel.removeEventListener('message', handleSessionMessage);
      channel.close();
    };
  }, [router]);
}
export default useSessionTimeout;
