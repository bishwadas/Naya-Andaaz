import { NextResponse } from 'next/server';
import { getTags } from '@/db/repository';
import { getTagUrl } from '@/lib/urls';
import { getSiteUrl, formatCanonicalUrl, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const rawTags = await getTags();

  const validTags = rawTags.filter(
    (t) => !(t as any).isTrashed && (t.slug || t.name)
  );

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  for (const tag of validTags) {
    const path = getTagUrl(tag);
    const loc = formatCanonicalUrl(path, siteUrl);

    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const lastmodDate = (tag as any).updatedAt || (tag as any).createdAt;
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

