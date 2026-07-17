import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account Locked',
};

export default function AccountLockedPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-backgroundestructive/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Account locked</h1>
        <p className="text-sm text-muted-foreground">
          Your account has been temporarily locked due to too many failed sign-in attempts.
        </p>
      </div>

      <div className="rounded-[--radius-lg] bg-muted/50 border border-border p-4 text-sm text-muted-foreground text-left space-y-2">
        <p className="font-medium text-foreground">What can you do?</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Wait 30 minutes and try again</li>
          <li>Reset your password using the link below</li>
          <li>Contact your system administrator</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[--radius-md] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Reset my password
        </Link>
        <a
          href="mailto:support@enterprise-pos.com"
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail className="w-4 h-4" />
          Contact support
        </a>
      </div>
    </div>
  );
}
