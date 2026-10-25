import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'admin_session';

async function isAuthed(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthed(req);

  // API-Schutz
  if (pathname.startsWith('/api/')) {
    // Öffentlich: Speiseplan nur lesen (öffentliche Seite + Druckseite)
    if (pathname === '/api/menu' && req.method === 'GET') {
      return NextResponse.next();
    }
    if (!authed) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // Admin-Seite: auf Login umleiten, wenn nicht angemeldet
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/menu',
    '/api/employees',
    '/api/employees/:path*',
    '/api/payroll-settings',
    '/api/timesheet',
    '/api/menus/:path*',
    '/api/meal-suggestions',
    '/api/reset',
    '/api/analyze-meal',
    '/api/analyze-allergens',
    '/api/analyze-allergens-v2',
    '/api/analyze-batch',
    '/api/analyze-historical-data',
    '/api/fix-meal-allergens',
    '/api/debug-meal-history'
  ]
};
