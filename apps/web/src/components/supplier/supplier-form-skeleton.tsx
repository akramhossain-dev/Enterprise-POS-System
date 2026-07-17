export function SupplierFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[...Array(4)].map((_, sectionIdx) => (
        <div key={sectionIdx} className="rounded-xl border border-border bg-cardard p-5">
          <div className="h-3 w-32 bg-muted rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={i === 0 && sectionIdx === 0 ? 'sm:col-span-2' : ''}>
                <div className="h-2.5 w-20 bg-muted rounded mb-1.5" />
                <div className="h-9 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-3">
        <div className="h-9 w-24 bg-muted rounded-lg" />
        <div className="h-9 w-32 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
