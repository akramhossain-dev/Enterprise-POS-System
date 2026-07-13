import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: `%s | ${appConfig.name}`,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden">
      {/* Aurora background effect */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/30 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/20 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EP</span>
            </div>
            <span className="font-bold text-xl text-foreground">Enterprise POS</span>
          </div>
          <p className="text-sm text-muted-foreground">Enterprise Retail Management</p>
        </div>

        {children}
      </div>
    </div>
  );
}
