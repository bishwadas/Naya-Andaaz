import { NextResponse } from 'next/server';
import { getPosts, getUsers } from '@/db/repository';
import { getAuthorUrl } from '@/lib/urls';
import { getSiteUrl, formatCanonicalUrl, escapeXml } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const siteUrl = getSiteUrl();

  const [rawPosts, allUsers] = await Promise.all([
    getPosts({
      status: 'published',
      limit: 50000,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    getUsers(),
  ]);

  const now = Date.now();
  const publishedPosts = rawPosts.filter((p) => {
    if (p.status !== 'published' || (p as any).isTrashed || !p.publishedAt) {
      return false;
    }
    const pubTime = new Date(p.publishedAt).getTime();
    return !isNaN(pubTime) && pubTime <= now;
  });

  // Map users by id for quick lookup
  const userMap = new Map<string, any>();
  for (const user of allUsers) {
    if (user && user.id) {
      userMap.set(user.id, user);
    }
  }

  // Filter authors who have at least one published post
  const activeAuthors = new Map<string, any>();
  for (const post of publishedPosts) {
    if (post.authorId && userMap.has(post.authorId)) {
      activeAuthors.set(post.authorId, userMap.get(post.authorId));
    } else if (post.author && (post.author.id || post.author.username || post.author.name)) {
      const key = post.author.id || post.author.username || post.author.name;
      activeAuthors.set(key, post.author);
    }
  }

  const seenUrls = new Set<string>();
  const urlNodes: string[] = [];

  for (const author of activeAuthors.values()) {
    const path = getAuthorUrl(author);
    const loc = formatCanonicalUrl(path, siteUrl);

    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
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
