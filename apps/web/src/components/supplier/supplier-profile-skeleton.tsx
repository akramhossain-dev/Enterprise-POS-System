export function SupplierProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-start gap-5 p-6 rounded-2xl border border-border bg-cardard">
        <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3 pt-1">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-3.5 w-32 bg-muted rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-20 bg-muted rounded-full" />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="h-9 w-20 bg-muted rounded-lg" />
          <div className="h-9 w-20 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-cardard space-y-2">
            <div className="h-2.5 w-20 bg-muted rounded" />
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-md" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
