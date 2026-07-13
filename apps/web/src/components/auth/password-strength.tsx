'use client';

import { usePasswordStrength } from '@/hooks/use-password-strength';
import { cn } from '@/utils/cn';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const SEGMENT_COLORS: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthProps) {
  const { score, label, color, feedback } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)} aria-live="polite" aria-atomic>
      {/* Bar */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              score >= segment ? SEGMENT_COLORS[score] : 'bg-muted',
            )}
          />
        ))}
        {label && (
          <span className={cn('text-xs font-medium ml-1 min-w-[42px]', color)}>{label}</span>
        )}
      </div>

      {/* Feedback tips */}
      {feedback.length > 0 && score < 3 && (
        <ul className="space-y-0.5">
          {feedback.slice(0, 2).map((tip) => (
            <li key={tip} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
