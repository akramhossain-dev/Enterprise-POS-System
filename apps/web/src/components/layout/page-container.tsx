import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn('space-y-6 outline-none', narrow && 'max-w-4xl', className)}
    >
      {children}
    </main>
  );
}
