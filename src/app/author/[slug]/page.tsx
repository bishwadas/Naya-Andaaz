import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getSettings,
  getPrimaryMenuItems,
  getMostSearchedTerms,
  getAuthorBySlug,
  getUsers,
} from '@/db/repository';
import { AuthorArchiveView } from '@/components/public/AuthorArchiveView';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { resolveSiteName, resolveSiteUrl } from '@/lib/seo';
import { formatCanonicalUrl } from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [authorData, settings] = await Promise.all([
    getAuthorBySlug(slug),
    getSettings().then((s) => (s ? (s as unknown as SiteSettings) : DEFAULT_SITE_SETTINGS)).catch(() => DEFAULT_SITE_SETTINGS),
  ]);

  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);

  if (!authorData || !authorData.author) {
    return { title: `Author Not Found | ${siteName}` };
  }

  const authorName = authorData.author.name || 'Author';
  const pageTitle = `${authorName} — Author | ${siteName}`;
  const description = authorData.author.bio || `Read articles and features written by ${authorName} on ${siteName}.`;
  const canonicalUrl = formatCanonicalUrl(`/author/${slug}`, baseUrl);

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    openGraph: {
      type: 'profile',
      siteName,
      title: pageTitle,
      description,
      url: canonicalUrl,
      images: authorData.author.avatar ? [{ url: authorData.author.avatar, alt: authorName }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
      images: authorData.author.avatar ? [authorData.author.avatar] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PublicAuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const authorData = await getAuthorBySlug(slug);

  if (!authorData || !authorData.author) {
    notFound();
  }

  const [categories, settings, primaryMenuItems, mostSearchedTerms, allUsers] = await Promise.all([
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPrimaryMenuItems(),
    getMostSearchedTerms(),
    getUsers(),
  ]);

  // Filter users to only those who are valid authors (Admin, Editor, Author, or have published posts)
  // Usually, we filter by role being admin, editor, or author.
  const validAuthors = allUsers.filter(u => 
    u.role?.toLowerCase() === 'admin' || 
    u.role?.toLowerCase() === 'editor' || 
    u.role?.toLowerCase() === 'author' ||
    ((u as any).postsCount && (u as any).postsCount > 0)
  );

  return (
    <AuthorArchiveView
      author={authorData.author}
      posts={authorData.posts}
      categories={categories}
      settings={settings}
      primaryMenuItems={primaryMenuItems}
      initialMostSearchedTerms={mostSearchedTerms}
      allAuthors={validAuthors}
    />
  );
}
