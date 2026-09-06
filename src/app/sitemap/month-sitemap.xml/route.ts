import { NextResponse } from 'next/server';
import { getPosts } from '@/db/repository';
import {
  getSiteUrl,
  getYearMonthInIST,
  formatToISTISO,
  formatCanonicalUrl,
  escapeXml,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const currentYearMonth = getYearMonthInIST(new Date());

  const rawPosts = await getPosts({
    status: 'published',
    limit: 50000,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const now = Date.now();
  const monthlyPosts = rawPosts.filter((post) => {
    if (
      post.status !== 'published' ||
      (post as any).isTrashed ||
      (post as any).visibility === 'private' ||
      !post.publishedAt
    ) {
      return false;
    }
    const pubTime = new Date(post.publishedAt).getTime();
    if (isNaN(pubTime) || pubTime > now) {
      return false;
    }
    return getYearMonthInIST(post.publishedAt) === currentYearMonth;
  });

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  for (const post of monthlyPosts) {
    const categorySlug = post.subCategory?.slug || post.category?.slug || 'uncategorized';
    const loc = formatCanonicalUrl(`${categorySlug}/${post.slug}`, siteUrl);
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const lastmod = formatToISTISO(post.publishedAt);
    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
