import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?callbackUrl=/admin');
  }

  const role = (user.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    if (role === 'EDITOR') {
      redirect('/editor');
    }
    if (role === 'AUTHOR') {
      redirect('/author');
    }
    redirect('/account/profile');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}

