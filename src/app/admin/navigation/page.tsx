import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories } from '@/db/repository';
import { NavigationManager } from '@/components/admin/NavigationManager';

export const dynamic = 'force-dynamic';

export default async function AdminNavigationPage() {
  const user = await getCurrentUser();
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  const categories = await getCategories();

  return <NavigationManager categories={categories || []} />;
}
