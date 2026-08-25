import { NextResponse } from 'next/server';
import { getPosts } from '@/db/repository';
import { getSiteUrl, getYearMonthInIST, formatToISTISO } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  const rawPosts = await getPosts({ status: 'published', limit: 10000 });

  const publishedPosts = rawPosts.filter(
    (p) => p.status === 'published' && !(p as any).isTrashed && p.publishedAt
  );

  // Group posts by YYYY-MM in IST based on publishedAt
  const monthlyGroups = new Map<string, { latestTimestamp: Date }>();

  for (const post of publishedPosts) {
    const yearMonth = getYearMonthInIST(post.publishedAt);
    if (!yearMonth) continue;

    const postTime = new Date(post.updatedAt || post.publishedAt).getTime();
    const existing = monthlyGroups.get(yearMonth);

    if (!existing || postTime > existing.latestTimestamp.getTime()) {
      monthlyGroups.set(yearMonth, {
        latestTimestamp: new Date(postTime),
      });
    }
  }

  // Sort months descending (e.g. 2026-08, 2026-07...)
  const sortedMonths = Array.from(monthlyGroups.keys()).sort().reverse();

  const sitemapsXml = sortedMonths
    .map((yearMonth) => {
      const group = monthlyGroups.get(yearMonth)!;
      const loc = `${siteUrl}/sitemap/monthly/${yearMonth}-month-sitemap.xml`;
      const lastmod = formatToISTISO(group.latestTimestamp);
      return `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXml}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
