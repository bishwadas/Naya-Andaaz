import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap/news-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap/category-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap/all-monthly-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap/tag-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap/author-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap/page-sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
