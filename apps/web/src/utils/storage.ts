/**
 * Secure storage utilities.
 * NOTE: Sensitive tokens should NOT be stored in localStorage.
 * Use httpOnly cookies via the server for tokens.
 * This module handles only non-sensitive preferences.
 */

const PREFIX = 'epos_';

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or unavailable — fail silently
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${PREFIX}${key}`);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },
} as const;

// Session storage (non-persistent)
export const sessionStorage_ = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(`${PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // fail silently
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${PREFIX}${key}`);
  },
} as const;
