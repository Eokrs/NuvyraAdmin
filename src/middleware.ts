
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'firebaseAuthToken';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthPage = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!authToken) {
      // Redirect to login if trying to access admin routes without token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Optional: redirect back after login
      return NextResponse.redirect(loginUrl);
    }
    // If token exists, assume it's valid. Server-side validation can be added if needed.
  } else if (isAuthPage) {
    if (authToken) {
      // Redirect to admin dashboard if trying to access login page with token
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }
  } else if (pathname === '/') {
     if (authToken) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*'],
};
