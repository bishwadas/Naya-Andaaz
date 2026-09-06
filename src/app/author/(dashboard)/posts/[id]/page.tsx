import React from 'react';
import { notFound } from 'next/navigation';
import { getCategories, getPostById, getPostBySlug, getTags } from '@/db/repository';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function AuthorEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  let post = await getPostById(id);
  if (!post) {
    post = await getPostBySlug(id);
  }

  if (!post) {
    notFound();
  }

  // Server-side ownership check: Author can ONLY edit their own post
  const isEditorOrAdmin = hasPermission(user.role, 'EDITOR');
  if (!isEditorOrAdmin && post.authorId !== user.id) {
    notFound();
  }

  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <PostEditor
      initialPost={post}
      categories={categories}
      tags={tags}
      users={[user]}
      role="AUTHOR"
      backUrl="/author/posts/all-posts"
    />
  );
}
