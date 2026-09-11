import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getPosts, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';
import SearchResultsView from '@/components/public/SearchResultsView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q = '' } = await searchParams;
  const rawQuery = q.trim();
  const settings = await getSettings().catch(() => DEFAULT_SITE_SETTINGS);
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  const title = rawQuery ? `Search: "${rawQuery}" | ${siteName}` : `Search Articles | ${siteName}`;
  const description = `Search articles, stories, and multimedia features on ${siteName}.`;
  const canonicalUrl = formatCanonicalUrl('/search', baseUrl);

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const rawQuery = q.trim();

  const [categories, settings, initialPosts, primaryMenuItems] = await Promise.all([
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPosts(
      rawQuery
        ? { search: rawQuery, status: 'published', limit: 12, offset: 0 }
        : { status: 'published', limit: 12, offset: 0 }
    ),
    getPrimaryMenuItems(),
  ]);

  return (
    <SearchResultsView
      query={rawQuery}
      initialPosts={initialPosts}
      categories={categories}
      settings={settings}
      primaryMenuItems={primaryMenuItems}
    />
  );
}
