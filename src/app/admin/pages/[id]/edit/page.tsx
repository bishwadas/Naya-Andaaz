import React from 'react';
import { notFound, redirect } from 'next/navigation';
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
  if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'editor')) {
    redirect('/login');
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
