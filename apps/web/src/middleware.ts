import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from '@/config/auth';

/**
 * Next.js Edge middleware for route-level auth protection.
 * Runs on the Edge runtime — no Node.js APIs.
 * Token validation happens in AuthProvider (client-side).
 * This middleware handles fast redirects based on cookie presence.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = authConfig.publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  const isProtectedRoute = authConfig.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  const isGuestOnly = authConfig.guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // Check for auth session cookie (httpOnly, set by API on login)
  const hasSessionCookie =
    request.cookies.has('pos_session') ||
    request.cookies.has('pos_refresh_token') ||
    request.cookies.has('refreshToken');

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL(authConfig.routes.login, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from guest-only routes (login, etc.)
  if (isGuestOnly && hasSessionCookie) {
    return NextResponse.redirect(new URL(authConfig.routes.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
