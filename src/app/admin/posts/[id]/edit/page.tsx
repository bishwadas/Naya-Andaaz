import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPostById, getCategories, getTags, getUsers } from '@/db/repository';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  // 1. Authorize user server-side
  const user = await getCurrentUser();
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  const { id } = await params;

  // 2. Load the specific post and other metadata
  const [post, categories, tags, users] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
    getUsers(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PostEditor
      initialPost={post}
      categories={categories}
      tags={tags}
      users={users}
    />
  );
}
