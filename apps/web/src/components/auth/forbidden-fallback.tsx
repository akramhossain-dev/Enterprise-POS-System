import { ShieldOff } from 'lucide-react';

export function ForbiddenFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-backgroundestructive/10 flex items-center justify-center mb-3">
        <ShieldOff className="w-6 h-6 text-destructive" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">Access Restricted</p>
      <p className="text-xs text-muted-foreground mt-1">
        You don&apos;t have permission to view this content.
      </p>
    </div>
  );
}
