import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldOff, ArrowLeft, LogIn } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Unauthorized',
  robots: { index: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-warning" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-warning uppercase tracking-widest">
            401 Unauthorized
          </p>
          <h1 className="text-3xl font-bold text-foreground">Authentication required</h1>
          <p className="text-muted-foreground">You must be signed in to access this page.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-md] border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
