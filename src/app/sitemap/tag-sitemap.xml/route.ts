import { NextResponse } from 'next/server';
import { getTags } from '@/db/repository';
import { getTagUrl } from '@/lib/urls';
import { getSiteUrl, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const tags = await getTags();

  const validTags = tags.filter((t) => !(t as any).isTrashed);

  const urlsXml = validTags
    .map((tag) => {
      const path = getTagUrl(tag);
      const loc = `${siteUrl}${escapeXml(path)}`;
      return `  <url>
    <loc>${loc}</loc>
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
