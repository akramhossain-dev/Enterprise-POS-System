'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { authConfig } from '@/config/auth';
import { VerificationCard } from '@/components/auth/verification-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { setUser, isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authService
      .verifyEmail({ token })
      .then((res) => {
        if (res.data?.user) setUser(res.data.user);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [token, setUser]);

  if (status === 'verifying') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <VerificationCard
        status={status === 'success' ? 'success' : 'error'}
        title={status === 'success' ? 'Email verified!' : 'Verification failed'}
        description={
          status === 'success'
            ? 'Your email has been verified successfully. You can now sign in.'
            : 'This verification link is invalid or has expired. Request a new one below.'
        }
        actionLabel={
          status === 'success'
            ? isAuthenticated
              ? 'Go to dashboard'
              : 'Sign in'
            : 'Resend verification'
        }
        actionHref={
          status === 'success'
            ? isAuthenticated
              ? authConfig.routes.dashboard
              : authConfig.routes.login
            : authConfig.routes.resendVerification
        }
      />

      {status === 'error' && (
        <div className="text-center">
          <Link
            href={authConfig.routes.login}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      )}
    </motion.div>
  );
}
