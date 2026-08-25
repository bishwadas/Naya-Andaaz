import { NextResponse } from 'next/server';
import { getPages } from '@/db/repository';
import { getSiteUrl, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const pages = await getPages();

  const publishedPages = pages.filter(
    (p) => p.status === 'published' && !(p as any).isTrashed
  );

  const urlsXml = publishedPages
    .map((page) => {
      const pagePath = page.slug === 'privacy-policy' ? '/privacy-policy' : `/page/${page.slug}`;
      const loc = `${siteUrl}${escapeXml(pagePath)}`;
      const lastmod = formatToISTISO(page.updatedAt || page.publishedAt || page.createdAt);
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
