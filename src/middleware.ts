import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // 301 permanent redirect from nayaandaaz.com to www.nayaandaaz.com
  if (host === 'nayaandaaz.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.nayaandaaz.com';
    url.port = '';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
