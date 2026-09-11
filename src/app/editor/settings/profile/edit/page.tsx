import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { AuthorProfileEdit } from '@/components/author/AuthorProfileEdit';

export const dynamic = 'force-dynamic';

export default async function EditorProfileEditPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'EDITOR')) notFound();

  return <AuthorProfileEdit user={user} />;
}
