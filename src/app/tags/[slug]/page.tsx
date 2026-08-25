import React from 'react';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getPosts,
  getTags,
  getSettings,
  getPrimaryMenuItems,
  getMostSearchedTerms,
} from '@/db/repository';
import { TagArchiveView } from '@/components/public/TagArchiveView';
import { SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';

export default async function TagArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim().replace(/[\s_]+/g, '-');

  const [allTags, categories, settings, primaryMenuItems, mostSearchedTerms] = await Promise.all([
    getTags(),
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPrimaryMenuItems(),
    getMostSearchedTerms(),
  ]);

  // Match tag by slug or normalized name
  const matchedTag = allTags.find(
    (t) =>
      t.slug.toLowerCase().trim() === cleanSlug ||
      t.name.toLowerCase().trim().replace(/[\s_]+/g, '-') === cleanSlug
  );

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
