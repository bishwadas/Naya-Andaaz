import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getPosts } from '@/db/repository';
import { EditorReviewQueueWidget } from '@/components/editor/EditorReviewQueueWidget';

export const dynamic = 'force-dynamic';

export default async function EditorReviewQueuePage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

  const allPosts = await getPosts({ limit: 500 });
  const pendingPosts = allPosts.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
          Editorial Review Queue
        </h1>
        <p className="text-xs text-stone-500">
          Articles submitted by authors waiting for proofreading, fact-checking, and publication approval
        </p>
      </div>

      <EditorReviewQueueWidget initialPosts={pendingPosts} />
    </div>
  );
}
