import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPosts, getCategories, getComments, getUsers, getDashboardMetrics } from '@/db/repository';
import { DashboardOverview } from '@/components/admin/DashboardOverview';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const role = (user?.role || '').toUpperCase();
  if (!user) {
    redirect('/sign-in?callbackUrl=/admin/dashboard');
  }
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    if (role === 'EDITOR') redirect('/editor');
    if (role === 'AUTHOR') redirect('/author');
    redirect('/account/profile');
  }

  const [metrics, postsRes, categories, comments, users] = await Promise.all([
    getDashboardMetrics().catch(() => null),
    getPosts({ limit: 20 }).catch(() => ({ posts: [], total: 0 })),
    getCategories().catch(() => []),
    getComments().catch(() => []),
    getUsers().catch(() => []),
  ]);

  const initialPosts = Array.isArray(postsRes) ? postsRes : (postsRes as any)?.posts || [];

  return (
    <DashboardOverview
      initialMetrics={metrics}
      initialPosts={initialPosts}
      initialCategories={categories || []}
      initialComments={comments || []}
      initialUsers={users || []}
    />
  );
}
