import { NextRequest, NextResponse } from 'next/server';

const PHOTOGRAPHER_COOKIE   = 'admin_session';
const PLATFORM_ADMIN_COOKIE = 'platform_admin_session';

// Structural check only (id.hmac) — real HMAC verification happens in the
// API routes (Node.js runtime), which is the actual security boundary.
// Edge middleware only uses this for redirect UX.
function looksLikePhotographerSession(value: string | undefined) {
  if (!value) return false;
  const [id, sig] = value.split('.');
  return Boolean(id) && Boolean(sig);
}

function platformAdminValue() {
  return `${process.env.ADMIN_SESSION_SECRET ?? 'dev-secret'}-admin`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPhotographer  = looksLikePhotographerSession(request.cookies.get(PHOTOGRAPHER_COOKIE)?.value);
  const isPlatformAdmin = request.cookies.get(PLATFORM_ADMIN_COOKIE)?.value === platformAdminValue();

  // Admin login page — redirect away if already authenticated
  if (pathname === '/admin') {
    if (isPlatformAdmin) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (isPhotographer)  return NextResponse.redirect(new URL('/photographer', request.url));
    return NextResponse.next();
  }

  // Admin dashboard routes — require platform admin session
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isPlatformAdmin) {
      if (isPhotographer) return NextResponse.redirect(new URL('/photographer', request.url));
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin API routes — require platform admin session (except the auth endpoint itself)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/auth') {
    if (!isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Photographer routes — redirect platform admin to their own dashboard
  if (pathname.startsWith('/photographer')) {
    if (isPlatformAdmin && !isPhotographer) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/photographer/:path*', '/api/admin/:path*'],
};
