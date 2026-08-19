import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories, getTags, getUsers } from '@/db/repository';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  // 1. Authorize user server-side
  const user = await getCurrentUser();
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  // 2. Load necessary relational lists
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
    />
  );
}
