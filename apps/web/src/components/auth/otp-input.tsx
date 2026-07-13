'use client';

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/utils/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  id?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  label,
  id = 'otp',
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, char: string) => {
      const digit = char.replace(/\D/g, '').slice(-1);
      if (!digit) return;

      const next = digits.map((d, i) => (i === index ? digit : d)).join('');
      onChange(next);

      if (index < length - 1) focusAt(index + 1);
    },
    [digits, length, onChange, focusAt],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (digits[index]) {
          const next = digits.map((d, i) => (i === index ? '' : d)).join('');
          onChange(next);
        } else if (index > 0) {
          const next = digits.map((d, i) => (i === index - 1 ? '' : d)).join('');
          onChange(next);
          focusAt(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusAt(index - 1);
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        focusAt(index + 1);
      }
    },
    [digits, length, onChange, focusAt],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (!pasted) return;
      onChange(pasted.padEnd(length, '').slice(0, length));
      focusAt(Math.min(pasted.length, length - 1));
    },
    [length, onChange, focusAt],
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-foreground" htmlFor={`${id}-0`}>
          {label}
        </label>
      )}

      <div
        className="flex items-center gap-2"
        role="group"
        aria-label={label ?? 'One-time password'}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={index === 0 ? `${id}-0` : undefined}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={!!error}
            className={cn(
              'h-12 w-10 rounded-[--radius-md] border border-input bg-background',
              'text-center text-lg font-semibold text-foreground',
              'ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'caret-transparent select-none',
              error && 'border-destructive',
              digit && 'border-primary bg-primary/5',
            )}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
