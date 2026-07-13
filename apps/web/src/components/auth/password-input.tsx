'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCapsLock } from '@/hooks/use-caps-lock';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  showStrength?: boolean;
  containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, containerClassName, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isCapsLock = useCapsLock();

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground">
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 pr-10',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            {...props}
          />

          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Caps Lock Warning */}
        {isCapsLock && (
          <p className="flex items-center gap-1.5 text-xs text-warning" role="alert">
            <span aria-hidden="true">⇧</span>
            Caps Lock is on
          </p>
        )}

        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
