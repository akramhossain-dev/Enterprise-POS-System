import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Forbidden' };

export default function ForbiddenPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="max-w-md">
        <div className="text-8xl font-black text-destructive/20 mb-4">403</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this resource. Contact your administrator if you
          believe this is an error.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
