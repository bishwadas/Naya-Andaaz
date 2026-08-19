import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-Side Role Authorization:
  // 1. Verify valid session
  // 2. Fetch current user from database
  // 3. Verify user has ADMIN role
  const user = await getCurrentUser();

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    // If not logged in, guest, or any role other than ADMIN,
    // trigger Next.js 404 Not Found directly on the current URL
    notFound();
  }

  return <>{children}</>;
}
