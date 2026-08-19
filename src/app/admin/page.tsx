import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Server-side authentication and role verification before rendering any admin content
  const user = await getCurrentUser();

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  return <AdminDashboardClient initialUser={user} initialRoute="dashboard" />;
}
