import type { Metadata } from 'next';
import { DashboardContent } from './dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Enterprise POS — Business overview and key metrics.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
