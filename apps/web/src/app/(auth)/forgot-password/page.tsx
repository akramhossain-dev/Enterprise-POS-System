import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Enterprise POS account password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          No worries. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
