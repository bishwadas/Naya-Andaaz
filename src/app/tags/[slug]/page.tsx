import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getPosts,
  getTags,
  getSettings,
  getPrimaryMenuItems,
  getMostSearchedTerms,
} from '@/db/repository';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, or, like, and } from 'drizzle-orm';
import { TagArchiveView } from '@/components/public/TagArchiveView';
import { SiteSettings, Tag } from '@/types';
import { DEFAULT_SITE_SETTINGS, INITIAL_TAGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

function normalizeTagSlug(rawSlug: string): string {
  try {
    const decoded = decodeURIComponent(rawSlug).trim();
    return decoded
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
  } catch {
    return rawSlug.toLowerCase().replace(/^#+/, '').replace(/[\s_]+/g, '-');
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = normalizeTagSlug(slug);
  const rawDecoded = decodeURIComponent(slug).toLowerCase().trim().replace(/^#+/, '');

  const [allTags, settings] = await Promise.all([
    getTags().catch(() => INITIAL_TAGS),
    getSettings()
      .then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS))
      .catch(() => DEFAULT_SITE_SETTINGS),
  ]);

  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  let matchedTag: Tag | undefined = allTags.find(
    (t) =>
      t.slug.toLowerCase().trim() === cleanSlug ||
      t.slug.toLowerCase().trim() === rawDecoded ||
      t.name.toLowerCase().trim().replace(/[\s_]+/g, '-') === cleanSlug ||
      t.name.toLowerCase().trim() === rawDecoded
  );

  if (!matchedTag) {
    try {
      const dbTag = await db.query.tags.findFirst({
        where: and(
          or(
            eq(tags.slug, cleanSlug),
            eq(tags.slug, rawDecoded),
            like(tags.name, cleanSlug.replace(/-/g, ' '))
          ),
          eq(tags.isTrashed, false)
        ),
      });
      if (dbTag) {
        matchedTag = {
          id: dbTag.id,
          name: dbTag.name,
          slug: dbTag.slug,
          description: dbTag.description || undefined,
          createdAt: dbTag.createdAt.toISOString(),
        };
      }
    } catch {
      // ignore
    }
  }

  if (!matchedTag) {
    return { title: `Topic Not Found | ${siteName}` };
  }

  const pageTitle = `${matchedTag.name} — Topic Stories & News | ${siteName}`;
  const description =
    matchedTag.description ||
    `Explore stories, insights, and latest news tagged with ${matchedTag.name} on ${siteName}.`;
  const canonicalUrl = formatCanonicalUrl(`/tags/${matchedTag.slug}`, baseUrl);

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    openGraph: {
      type: 'website',
      siteName,
      title: pageTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function TagArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = normalizeTagSlug(slug);
  const rawDecoded = decodeURIComponent(slug).toLowerCase().trim().replace(/^#+/, '');

  const [allTags, categories, settings, primaryMenuItems, mostSearchedTerms] = await Promise.all([
    getTags(),
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPrimaryMenuItems(),
    getMostSearchedTerms(),
  ]);

  // Match tag by slug or normalized name
  let matchedTag: Tag | undefined = allTags.find(
    (t) =>
      t.slug.toLowerCase().trim() === cleanSlug ||
      t.slug.toLowerCase().trim() === rawDecoded ||
      t.name.toLowerCase().trim().replace(/[\s_]+/g, '-') === cleanSlug ||
      t.name.toLowerCase().trim() === rawDecoded
  );

  if (!matchedTag) {
    try {
      const dbTag = await db.query.tags.findFirst({
        where: and(
          or(
            eq(tags.slug, cleanSlug),
            eq(tags.slug, rawDecoded),
            like(tags.name, cleanSlug.replace(/-/g, ' '))
          ),
          eq(tags.isTrashed, false)
        ),
        with: { postTags: true },
      });
      if (dbTag) {
        matchedTag = {
          id: dbTag.id,
          name: dbTag.name,
          slug: dbTag.slug,
          description: dbTag.description || undefined,
          postCount: dbTag.postTags?.length || 0,
          createdAt: dbTag.createdAt.toISOString(),
        };
      }
    } catch {
      // ignore
    }
  }

  if (!matchedTag) {
    notFound();
  }

  const tagPosts = await getPosts({
    tagSlug: matchedTag.slug,
    status: 'published',
    limit: 100,
  });

  return (
    <TagArchiveView
      tag={matchedTag}
      posts={tagPosts}
      categories={categories}
      settings={settings}
      primaryMenuItems={primaryMenuItems}
      initialMostSearchedTerms={mostSearchedTerms}
    />
  );
}
