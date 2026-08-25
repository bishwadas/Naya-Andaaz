import { NextResponse } from 'next/server';
import { getPosts } from '@/db/repository';
import { getSiteUrl, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const rawPosts = await getPosts({ status: 'published', limit: 10000 });

  const publishedPosts = rawPosts.filter(
    (p) => p.status === 'published' && !(p as any).isTrashed && p.publishedAt
  );

  const urlsXml = publishedPosts
    .map((post) => {
      const loc = `${siteUrl}/${escapeXml(post.slug)}`;
      const lastmod = formatToISTISO(post.updatedAt || post.publishedAt);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    })
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
