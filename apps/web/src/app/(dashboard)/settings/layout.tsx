import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { User, KeyRound, ImageIcon, Monitor } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'Settings',
    template: '%s | Settings',
  },
};

const NAV_ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/profile/password', label: 'Password', icon: KeyRound },
  { href: '/settings/profile/avatar', label: 'Avatar', icon: ImageIcon },
  { href: '/settings/profile/sessions', label: 'Sessions', icon: Monitor },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar nav */}
        <nav className="lg:w-52 shrink-0">
          <ul className="flex gap-1 lg:flex-col overflow-x-auto pb-2 lg:pb-0">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[--radius-md] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
