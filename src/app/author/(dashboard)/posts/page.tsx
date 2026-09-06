import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPosts, getCategories } from '@/db/repository';
import { AuthorPostsClient } from '@/components/author/AuthorPostsClient';

export const dynamic = 'force-dynamic';

export default async function AuthorPostsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  // Query posts restricted to authorId strictly at database query level
  const [authorPosts, categories] = await Promise.all([
    getPosts({
      authorId: user.id,
      limit: 500,
    }),
    getCategories()
  ]);

  return <AuthorPostsClient initialPosts={authorPosts} categories={categories} />;
}
