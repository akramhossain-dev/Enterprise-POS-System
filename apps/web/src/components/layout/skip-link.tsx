import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-450 focus:shadow-lg transition-all text-xs uppercase tracking-wider font-sans"
    >
      Skip to main content
    </a>
  );
}
