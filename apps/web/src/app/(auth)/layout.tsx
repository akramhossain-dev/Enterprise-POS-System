import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { appConfig } from '@/config/app';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: `%s | ${appConfig.name}`,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] opacity-60 dark:opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-[100px] opacity-50 dark:opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] opacity-40 dark:opacity-20" />
      </div>

      {/* Theme switcher — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {/* Brand logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-primary-foreground font-bold text-sm tracking-tight">EP</span>
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">Enterprise POS</span>
          </div>
          <p className="text-xs text-muted-foreground">Enterprise Retail Management Platform</p>
        </div>

        {/* Page card */}
        <div className="rounded-[--radius-xl] border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20 p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
