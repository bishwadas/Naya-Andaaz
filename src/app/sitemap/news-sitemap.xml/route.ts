import { NextResponse } from 'next/server';
import { getPosts, getSettings } from '@/db/repository';
import {
  getSiteUrl,
  formatCanonicalUrl,
  cleanImageUrl,
  formatToISTISO,
  escapeXml,
  formatNewsKeywords,
  NEWS_PUBLICATION_NAME,
  NEWS_DEFAULT_LANGUAGE,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();
  
  // Fetch site settings to allow dynamic publication name if configured
  const settings = await getSettings().catch(() => null);
  const publicationName =
    settings?.siteName && settings.siteName !== 'Sereia'
      ? settings.siteName
      : NEWS_PUBLICATION_NAME;

  const rawPosts = await getPosts({
    status: 'published',
    limit: 1000,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Filter valid published posts
  const publishedPosts = rawPosts.filter((p) => {
    if (p.status !== 'published' || (p as any).isTrashed || !p.publishedAt) {
      return false;
    }
    const pubTime = new Date(p.publishedAt).getTime();
    return !isNaN(pubTime) && pubTime <= now;
  });

  // Last one month eligibility filter
  let eligiblePosts = publishedPosts.filter((p) => {
    const pubTime = new Date(p.publishedAt).getTime();
    return pubTime >= oneMonthAgo;
  });

  // Fallback for staging/dev environments where articles may be older than 1 month
  if (eligiblePosts.length === 0 && publishedPosts.length > 0) {
    eligiblePosts = publishedPosts.slice(0, 10);
  }

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  for (const post of eligiblePosts) {
    const loc = formatCanonicalUrl(`${post.subCategory?.slug || 'uncategorized'}/${post.slug}`, siteUrl);
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const pubDate = formatToISTISO(post.publishedAt);
    const title = escapeXml(post.title || post.seoTitle || post.slug);
    const keywords = formatNewsKeywords(post.tags, post.focusKeyword, post.metaDescription);
    const featuredImg = cleanImageUrl(post.featuredImage || post.ogImage, siteUrl);

    let newsXml = `    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>${NEWS_DEFAULT_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>`;

    if (keywords) {
      newsXml += `\n      <news:keywords>${keywords}</news:keywords>`;
    }

    newsXml += `\n    </news:news>`;

    let imageXml = '';
    if (featuredImg) {
      imageXml = `\n    <image:image>
      <image:loc>${escapeXml(featuredImg)}</image:loc>
    </image:image>`;
    }

    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
${newsXml}${imageXml}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlNodes.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

