import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPosts } from '@/db/repository';
import { AuthorPostsClient } from '@/components/author/AuthorPostsClient';

export const dynamic = 'force-dynamic';

export default async function AuthorAllPostsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  // Query posts restricted to authorId strictly at database query level
  const authorPosts = await getPosts({
    authorId: user.id,
    limit: 500,
  });

  return <AuthorPostsClient initialPosts={authorPosts} authorName={user.name} />;
}
