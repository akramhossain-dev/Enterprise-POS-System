import type { Metadata } from 'next';
import Link from 'next/link';
import { Ban, ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forbidden',
  robots: { index: false },
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <Ban className="w-10 h-10 text-destructive" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive uppercase tracking-widest">
            403 Forbidden
          </p>
          <h1 className="text-3xl font-bold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to view this page. Contact your administrator if you
            believe this is a mistake.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-md] border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
