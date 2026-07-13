import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Unauthorized' };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="max-w-md">
        <div className="text-8xl font-black text-warning/20 mb-4">401</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Session Expired</h1>
        <p className="text-muted-foreground mb-8">
          Your session has expired or you are not authenticated. Please sign in to continue.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
