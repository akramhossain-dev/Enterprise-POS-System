import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Enterprise POS account to manage your retail operations.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account to continue.</p>
      </div>
      <LoginForm />
    </div>
  );
}
