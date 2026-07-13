import { redirect } from 'next/navigation';

/**
 * Root page — redirect to dashboard.
 * Middleware handles auth gate; this just ensures / → /dashboard.
 */
export default function RootPage() {
  redirect('/dashboard');
}
