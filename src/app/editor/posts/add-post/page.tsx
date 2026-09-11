import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getCategories, getTags, getUsers } from '@/db/repository';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function EditorAddPostPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

  const [categories, tags, users] = await Promise.all([
    getCategories(),
    getTags(),
    getUsers(),
  ]);

  return (
    <PostEditor
      categories={categories}
      tags={tags}
      users={users}
      role="EDITOR"
      backUrl="/editor/posts/all-posts"
    />
  );
}
