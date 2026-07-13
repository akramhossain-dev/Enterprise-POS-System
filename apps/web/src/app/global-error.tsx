'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col items-center justify-center bg-gray-950 text-white text-center px-4">
        <div className="max-w-md">
          <div className="text-8xl font-black text-red-900 mb-4">500</div>
          <h1 className="text-2xl font-bold mb-2">Critical Error</h1>
          <p className="text-gray-400 mb-4">{error.message ?? 'A critical error occurred.'}</p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
