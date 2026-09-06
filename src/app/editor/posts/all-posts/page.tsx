import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getPosts, getCategories, getUsers } from '@/db/repository';
import { EditorPostsManager } from '@/components/editor/EditorPostsManager';

export const dynamic = 'force-dynamic';

export default async function EditorAllPostsPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

  const [posts, categories, users] = await Promise.all([
    getPosts({ limit: 500 }),
    getCategories(),
    getUsers(),
  ]);

  return (
    <EditorPostsManager
      initialPosts={posts}
      categories={categories}
      users={users}
    />
  );
}
