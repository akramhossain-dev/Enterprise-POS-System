import type { Metadata } from 'next';
import { TwoFactorForm } from '@/components/auth/two-factor-form';

export const metadata: Metadata = {
  title: 'Two-Factor Authentication',
  description: 'Verify your identity with two-factor authentication',
};

export default function TwoFactorPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Two-factor authentication</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <TwoFactorForm />
    </div>
  );
}
