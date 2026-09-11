import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SubscriberProfileClient } from '@/components/account/SubscriberProfileClient';

export const dynamic = 'force-dynamic';

export default async function AccountProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return <SubscriberProfileClient user={user} />;
}
