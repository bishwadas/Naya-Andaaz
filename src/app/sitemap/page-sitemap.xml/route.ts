import { NextResponse } from 'next/server';
import { getPages } from '@/db/repository';
import { getSiteUrl, formatCanonicalUrl, formatToISTISO, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRIVATE_SLUGS = new Set(['admin', 'editor', 'author', 'dashboard', 'login', 'register', 'api', 'preview']);

export async function GET() {
  const siteUrl = getSiteUrl();
  const rawPages = await getPages().catch(() => []);

  const publishedPages = rawPages.filter(
    (p) =>
      p.status === 'published' &&
      !(p as any).isTrashed &&
      p.slug &&
      !PRIVATE_SLUGS.has(p.slug.toLowerCase().trim())
  );

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  // Guarantee the 3 core canonical pages are always in the sitemap
  const corePages = [
    { path: '/page/about-us', priority: '0.8', lastmod: new Date().toISOString() },
    { path: '/page/terms-and-conditions', priority: '0.6', lastmod: new Date().toISOString() },
    { path: '/privacy-policy', priority: '0.6', lastmod: new Date().toISOString() },
  ];

  for (const cp of corePages) {
    const loc = formatCanonicalUrl(cp.path, siteUrl);
    seenUrls.add(loc);
    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatToISTISO(cp.lastmod)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${cp.priority}</priority>
  </url>`);
  }

  for (const page of publishedPages) {
    const slugTrimmed = page.slug.trim().toLowerCase();
    let pagePath: string;
    if (slugTrimmed === 'privacy-policy') {
      pagePath = '/privacy-policy';
    } else if (slugTrimmed === 'terms-and-conditions' || slugTrimmed === 'terms-of-service' || slugTrimmed === 'terms') {
      pagePath = '/page/terms-and-conditions';
    } else if (slugTrimmed === 'about' || slugTrimmed === 'about-us') {
      pagePath = '/page/about-us';
    } else if (slugTrimmed === 'contact' || slugTrimmed === 'contact-us') {
      pagePath = '/page/contact-us';
    } else {
      pagePath = `/page/${page.slug}`;
    }

    const loc = formatCanonicalUrl(pagePath, siteUrl);
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const lastmod = formatToISTISO(page.updatedAt || page.publishedAt || page.createdAt);

    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
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
