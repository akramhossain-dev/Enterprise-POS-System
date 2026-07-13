export default function LoadingPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
