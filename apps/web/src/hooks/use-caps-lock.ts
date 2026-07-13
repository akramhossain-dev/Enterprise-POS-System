import { useState, useEffect } from 'react';

/**
 * Detects whether Caps Lock is currently active.
 * Listens to keydown/keyup events on the window.
 */
export function useCapsLock(): boolean {
  const [isCapsLock, setIsCapsLock] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setIsCapsLock(e.getModifierState('CapsLock'));
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  return isCapsLock;
}
