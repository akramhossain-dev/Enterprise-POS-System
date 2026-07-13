'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={theme as 'light' | 'dark' | 'system' | undefined}
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'font-sans text-sm rounded-lg border border-border shadow-lg',
            title: 'font-semibold',
            description: 'text-muted-foreground',
          },
        }}
      />
    </>
  );
}
