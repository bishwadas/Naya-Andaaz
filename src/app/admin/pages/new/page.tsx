import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUsers } from '@/db/repository';
import { PageEditor } from '@/components/admin/PageEditor';

export const dynamic = 'force-dynamic';

export default async function NewPageApplet() {
  // 1. Authorize user server-side
  const user = await getCurrentUser();
  if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'editor')) {
    redirect('/login');
  }

  // 2. Load users for author assignment
  const users = await getUsers();

  return <PageEditor users={users} />;
}
