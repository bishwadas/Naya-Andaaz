import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getMedia } from '@/db/repository';
import { MediaManager } from '@/components/admin/MediaManager';

export const dynamic = 'force-dynamic';

export default async function EditorMediaPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) {
    notFound();
  }

  const mediaList = await getMedia();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
          Media Library
        </h1>
        <p className="text-xs text-stone-500">
          Upload and manage editorial assets, hero images, and graphics
        </p>
      </div>

      <MediaManager initialMedia={mediaList || []} />
    </div>
  );
}
