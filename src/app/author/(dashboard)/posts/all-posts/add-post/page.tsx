import React from 'react';
import { notFound } from 'next/navigation';
import { getCategories, getTags } from '@/db/repository';
import { getCurrentUser } from '@/lib/auth';
import { PostEditor } from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function AuthorAddPostPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <PostEditor
      categories={categories}
      tags={tags}
      users={[user]}
      role="AUTHOR"
      backUrl="/author/posts/all-posts"
    />
  );
}
