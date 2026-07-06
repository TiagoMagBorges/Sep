import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JWTPayload {
  role: 'ADMIN' | 'PROFESSOR';
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sep.token')?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAdminRoute = pathname.startsWith('/admin');
  const isPrivateRoute = !isAuthRoute && !isAdminRoute && pathname !== '/';

  if (!token) {
    if (isAdminRoute || isPrivateRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64)) as JWTPayload;
    const role = decodedPayload.role;

    if (isAuthRoute || pathname === '/') {
      return NextResponse.redirect(new URL(role === 'ADMIN' ? '/admin/users' : '/dashboard', request.url));
    }

    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isPrivateRoute && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/users', request.url));
    }
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('sep.token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};