import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories } from '@/db/repository';
import { VideosManager } from '@/components/admin/VideosManager';

export const dynamic = 'force-dynamic';

export default async function AdminVideosPage() {
  const user = await getCurrentUser();
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  const categories = await getCategories();

  return <VideosManager categories={categories || []} />;
}
