import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SubscriberPasswordClient } from '@/components/account/SubscriberPasswordClient';

export const dynamic = 'force-dynamic';

export default async function AccountPasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return <SubscriberPasswordClient user={user} />;
}
