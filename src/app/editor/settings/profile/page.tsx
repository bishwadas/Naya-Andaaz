import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getAuthorStats } from '@/db/repository';
import { AuthorProfileView } from '@/components/author/AuthorProfileView';

export const dynamic = 'force-dynamic';

export default async function EditorProfilePage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

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
