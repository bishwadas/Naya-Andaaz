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
    redirect('/sign-in?redirect=/admin/dashboard');
  }

  const role = user.role?.toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    if (role === 'EDITOR') {
      redirect('/editor');
    }
    if (role === 'AUTHOR') {
      redirect('/author');
    }
    redirect('/?error=admin_required');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}

