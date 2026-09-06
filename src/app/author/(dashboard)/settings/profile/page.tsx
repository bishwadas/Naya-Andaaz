import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAuthorStats } from '@/db/repository';
import { AuthorProfileView } from '@/components/author/AuthorProfileView';

export const dynamic = 'force-dynamic';

export default async function AuthorProfilePage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const stats = await getAuthorStats(user.id);

  return (
    <AuthorProfileView
      user={user}
      stats={{
        totalPosts: stats.totalPosts,
        publishedCount: stats.publishedCount,
        totalViews: stats.totalViews,
      }}
    />
  );
}
