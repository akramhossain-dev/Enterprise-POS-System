import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Session Expired',
};

export default function SessionExpiredPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
        <Clock className="w-8 h-8 text-warning" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Session expired</h1>
        <p className="text-sm text-muted-foreground">
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Sign in again
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
