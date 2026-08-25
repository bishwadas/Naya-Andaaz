import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();

  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
