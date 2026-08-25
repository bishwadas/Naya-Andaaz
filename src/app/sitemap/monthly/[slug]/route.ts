import { NextResponse } from 'next/server';
import { getPosts } from '@/db/repository';
import { getSiteUrl, getYearMonthInIST, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const match = slug.match(/^(\d{4}-\d{2})/);

  if (!match) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const targetYearMonth = match[1];
  const siteUrl = getSiteUrl();

  const rawPosts = await getPosts({ status: 'published', limit: 10000 });

  const monthlyPosts = rawPosts.filter((post) => {
    if (post.status !== 'published' || (post as any).isTrashed || !post.publishedAt) {
      return false;
    }
    return getYearMonthInIST(post.publishedAt) === targetYearMonth;
  });

  const urlsXml = monthlyPosts
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
