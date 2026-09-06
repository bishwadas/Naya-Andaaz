import { NextResponse } from 'next/server';
import { getCategories } from '@/db/repository';
import { getCategoryUrl } from '@/lib/categories';
import { getSiteUrl, formatCanonicalUrl, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const rawCategories = await getCategories();

  const validCategories = rawCategories.filter(
    (c) => !(c as any).isTrashed && c.slug && c.slug.trim().length > 0
  );

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  for (const category of validCategories) {
    const path = getCategoryUrl(category as any, validCategories as any);
    const loc = formatCanonicalUrl(path, siteUrl);

    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const lastmodDate = (category as any).updatedAt || (category as any).createdAt;
    const lastmodXml = lastmodDate ? `\n    <lastmod>${formatToISTISO(lastmodDate)}</lastmod>` : '';

    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodXml}
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

