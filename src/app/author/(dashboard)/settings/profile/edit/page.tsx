import React from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AuthorProfileEdit } from '@/components/author/AuthorProfileEdit';

export const dynamic = 'force-dynamic';

export default async function AuthorProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  return <AuthorProfileEdit user={user} />;
}
