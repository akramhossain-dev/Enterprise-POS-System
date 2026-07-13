'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import { titleCase } from '@/utils/format';

function pathToBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, index) => ({
    label: titleCase(part.replace(/-/g, ' ')),
    href: '/' + parts.slice(0, index + 1).join('/'),
    isLast: index === parts.length - 1,
  }));
}

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = pathToBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight
              className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0"
              aria-hidden="true"
            />
            {crumb.isLast ? (
              <span
                className="font-medium text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]',
                )}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
