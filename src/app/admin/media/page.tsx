import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMedia } from '@/db/repository';
import { MediaManager } from '@/components/admin/MediaManager';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const user = await getCurrentUser();
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  const mediaList = await getMedia();

  return <MediaManager initialMedia={mediaList || []} />;
}
