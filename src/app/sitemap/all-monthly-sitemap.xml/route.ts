import { NextResponse } from 'next/server';
import { getPosts } from '@/db/repository';
import { getSiteUrl, getYearMonthInIST, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();

  const rawPosts = await getPosts({
    status: 'published',
    limit: 50000,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const now = Date.now();
  const publishedPosts = rawPosts.filter((p) => {
    if (p.status !== 'published' || (p as any).isTrashed || !p.publishedAt) {
      return false;
    }
    const pubTime = new Date(p.publishedAt).getTime();
    return !isNaN(pubTime) && pubTime <= now;
  });

  // Group posts by Year-Month in IST timezone (YYYY-MM)
  const monthDataMap = new Map<string, { latestDate: Date }>();

  for (const post of publishedPosts) {
    const ym = getYearMonthInIST(post.publishedAt);
    if (ym && /^\d{4}-\d{2}$/.test(ym)) {
      const postDate = new Date(post.updatedAt || post.publishedAt);
      const validDate = !isNaN(postDate.getTime()) ? postDate : new Date(post.publishedAt);

      if (!monthDataMap.has(ym)) {
        monthDataMap.set(ym, { latestDate: validDate });
      } else {
        const current = monthDataMap.get(ym)!;
        if (validDate.getTime() > current.latestDate.getTime()) {
          current.latestDate = validDate;
        }
      }
    }
  }

  // Sort newest month first
  const sortedMonths = Array.from(monthDataMap.keys()).sort().reverse();

  const sitemapNodes = sortedMonths.map((ym) => {
    const data = monthDataMap.get(ym)!;
    const loc = `${siteUrl}/sitemap/monthly/${ym}-month-sitemap-hi.xml`;
    const lastmod = formatToISTISO(data.latestDate);

    return `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNodes.join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
