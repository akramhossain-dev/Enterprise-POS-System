import { appConfig } from '@/config/app';
import Link from 'next/link';

export function DashboardFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-background/50">
      <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.name} — v{appConfig.version}
        </p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-foreground transition-colors">
            Documentation
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Support
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
