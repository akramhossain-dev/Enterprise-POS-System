import { useMemo } from 'react';

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0–4
  strength: PasswordStrength;
  label: string;
  color: string;
  percentage: number;
  feedback: string[];
}

/**
 * Calculates password strength score and feedback.
 * Score: 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => {
    if (!password) {
      return { score: 0, strength: 'empty', label: '', color: '', percentage: 0, feedback: [] };
    }

    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score++;
    else if (password.length >= 8) feedback.push('12+ characters makes it stronger');

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    else feedback.push('Mix uppercase and lowercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
    else feedback.push('Add special characters (!@#$...)');

    // Clamp to 0-4
    const clampedScore = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

    const map: Record<
      0 | 1 | 2 | 3 | 4,
      Omit<PasswordStrengthResult, 'score' | 'feedback' | 'percentage'>
    > = {
      0: { strength: 'empty', label: '', color: '' },
      1: { strength: 'weak', label: 'Weak', color: 'text-red-500' },
      2: { strength: 'fair', label: 'Fair', color: 'text-orange-500' },
      3: { strength: 'good', label: 'Good', color: 'text-yellow-500' },
      4: { strength: 'strong', label: 'Strong', color: 'text-green-500' },
    };

    return {
      score: clampedScore,
      ...map[clampedScore],
      percentage: (clampedScore / 4) * 100,
      feedback,
    };
  }, [password]);
}
