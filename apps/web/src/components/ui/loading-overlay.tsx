'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './spinner';
import { cn } from '@/utils/cn';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  visible,
  message = 'Loading…',
  blur = true,
  className,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center gap-3',
            blur && 'backdrop-blur-sm',
            'bg-background/70',
            className,
          )}
          role="status"
          aria-label={message}
          aria-live="polite"
        >
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
