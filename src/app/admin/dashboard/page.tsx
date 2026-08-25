import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPosts, getCategories, getComments, getUsers } from '@/db/repository';
import { DashboardOverview } from '@/components/admin/DashboardOverview';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?redirect=/admin/dashboard');
  }

  const [postsRes, categories, comments, users] = await Promise.all([
    getPosts({ limit: 10 }),
    getCategories(),
    getComments(),
    getUsers(),
  ]);

  const initialPosts = Array.isArray(postsRes) ? postsRes : (postsRes as any)?.posts || [];

  return (
    <DashboardOverview
      initialPosts={initialPosts}
      initialCategories={categories || []}
      initialComments={comments || []}
      initialUsers={users || []}
    />
  );
}
