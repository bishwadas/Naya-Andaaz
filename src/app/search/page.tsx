import React from 'react';
import { getCategories, getPosts, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import SearchResultsView from '@/components/public/SearchResultsView';

export const dynamic = 'force-dynamic';

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
