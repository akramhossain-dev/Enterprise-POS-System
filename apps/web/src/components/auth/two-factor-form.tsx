'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { twoFactorSchema, type TwoFactorInput } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { normalizeError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { OtpInput } from './otp-input';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/config/auth';

export function TwoFactorForm() {
  const router = useRouter();
  const { setUser, setAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [useBackup, setUseBackup] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorInput, unknown, TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema) as never,
    defaultValues: { code: '', useBackupCode: false },
  });

  const onSubmit = async (data: TwoFactorInput) => {
    setError(null);
    try {
      const result = await authService.verifyTwoFactor(data);
      setUser(result.user);
      setAuthenticated(true);
      router.push(authConfig.routes.dashboard);
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  const toggleBackup = useCallback(() => {
    setUseBackup((v) => !v);
    setValue('code', '');
    setValue('useBackupCode', !useBackup);
  }, [useBackup, setValue]);

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
      </div>

      {error && <Alert variant="destructive" title="Verification failed" description={error} />}

      {!useBackup ? (
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <OtpInput
              id="two-factor-code"
              label="Authentication code"
              value={field.value}
              onChange={field.onChange}
              error={errors.code?.message}
              autoFocus
            />
          )}
        />
      ) : (
        <Input
          {...{
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue('code', e.target.value),
          }}
          id="backup-code"
          label="Backup code"
          placeholder="Enter your backup code"
          autoFocus
          error={errors.code?.message}
        />
      )}

      <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
        Verify
      </Button>

      <button
        type="button"
        onClick={toggleBackup}
        className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {useBackup ? 'Use authenticator app instead' : 'Use a backup code instead'}
      </button>
    </motion.form>
  );
}
