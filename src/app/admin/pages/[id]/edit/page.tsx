import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPageById, getPageBySlug, getUsers } from '@/db/repository';
import { PageEditor } from '@/components/admin/PageEditor';

export const dynamic = 'force-dynamic';

interface EditPageAppletProps {
  params: Promise<{ id: string }>;
}

export default async function EditPageApplet({ params }: EditPageAppletProps) {
  // 1. Authorize user server-side
  const user = await getCurrentUser();
  const role = (user?.role || '').toLowerCase();
  if (!user || (role !== 'admin' && role !== 'superadmin')) {
    notFound();
  }

  const { id } = await params;

  // 2. Fetch page by ID or fallback to slug
  let page = await getPageById(id);
  if (!page) {
    page = await getPageBySlug(id);
  }

  if (!page) {
    notFound();
  }

  const users = await getUsers();

  return <PageEditor initialPage={page} users={users} />;
}
