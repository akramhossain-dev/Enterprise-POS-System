import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Enterprise POS account',
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
