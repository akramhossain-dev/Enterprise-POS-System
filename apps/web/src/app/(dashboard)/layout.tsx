import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DashboardLayoutClient } from './layout-client';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: `%s | ${appConfig.name}`,
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
