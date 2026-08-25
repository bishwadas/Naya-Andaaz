import React from 'react';
import { notFound } from 'next/navigation';
import { getCategories, getPostById, getPostBySlug, getTags, getUsers } from '@/db/repository';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function EditorEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

  let post = await getPostById(id);
  if (!post) {
    post = await getPostBySlug(id);
  }

  if (!post) {
    notFound();
  }

  const [categories, tags, users] = await Promise.all([
    getCategories(),
    getTags(),
    getUsers(),
  ]);

  return (
    <PostEditor
      initialPost={post}
      categories={categories}
      tags={tags}
      users={users}
      role="EDITOR"
      backUrl="/editor/posts/all-posts"
    />
  );
}
