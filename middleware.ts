import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * HTTP Basic Authentication check.
 * Returns a 401 response if credentials are missing/wrong,
 * or null if the request should be allowed through.
 */
function checkBasicAuth(req: NextRequest): NextResponse | null {
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  // If env vars are not set, skip basic auth entirely
  if (!username || !password) return null;

  const header = req.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8');
    const sep = decoded.indexOf(':');
    if (sep !== -1) {
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === username && pass === password) return null;
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Utazofotós", charset="UTF-8"' },
  });
}

// Wrap NextAuth middleware so admin session checks still work
export default auth((req) => {
  // /api/* routes skip Basic Auth
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    const denied = checkBasicAuth(req);
    if (denied) return denied;
  }
  return NextResponse.next();
});

export const config = {
  // Match everything except static files, images, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
