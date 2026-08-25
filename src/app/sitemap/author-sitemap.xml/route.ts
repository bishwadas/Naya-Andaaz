import { NextResponse } from 'next/server';
import { getUsers } from '@/db/repository';
import { getAuthorUrl } from '@/lib/urls';
import { getSiteUrl, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const users = await getUsers();

  const validAuthors = users.filter((u) => {
    if ((u as any).isTrashed) return false;
    const role = (u.role || '').toLowerCase();
    const isEditorialRole = role === 'admin' || role === 'editor' || role === 'author';
    const hasPublishedPosts = Boolean(u.postsCount && u.postsCount > 0);
    return isEditorialRole || hasPublishedPosts;
  });

  const seenLocs = new Set<string>();
  const urlsXml = validAuthors
    .map((author) => {
      const path = getAuthorUrl(author);
      const loc = `${siteUrl}${escapeXml(path)}`;
      if (seenLocs.has(loc)) return null;
      seenLocs.add(loc);
      return `  <url>
    <loc>${loc}</loc>
  </url>`;
    })
    .filter(Boolean)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
