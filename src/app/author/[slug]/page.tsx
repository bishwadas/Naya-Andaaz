import React from 'react';
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

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const authorData = await getAuthorBySlug(slug);

  if (!authorData || !authorData.author) {
    return { title: 'Author Not Found | Sereia' };
  }

  const authorName = authorData.author.name || 'Author';
  return {
    title: `${authorName} — Author | Sereia`,
    description: authorData.author.bio || `Read articles written by ${authorName} on Sereia.`,
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
