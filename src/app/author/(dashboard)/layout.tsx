import { redirect } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { AuthorLayoutClient } from '@/components/author/AuthorLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AuthorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?redirect=/author');
  }

  if (!hasPermission(user.role, 'AUTHOR')) {
    redirect('/?error=author_required');
  }

  return <AuthorLayoutClient user={user}>{children}</AuthorLayoutClient>;
}

