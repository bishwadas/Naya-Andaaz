import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { AdminRouteId } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

function mapSlugToRouteId(slugSegments: string[]): AdminRouteId {
  const path = slugSegments.join('/').toLowerCase();
  const routeMap: Record<string, AdminRouteId> = {
    'dashboard': 'dashboard',
    'posts': 'posts_all',
    'posts/all': 'posts_all',
    'posts/add': 'posts_add',
    'posts_all': 'posts_all',
    'posts_add': 'posts_add',
    'categories': 'categories',
    'tags': 'tags',
    'media': 'media',
    'pages': 'pages_all',
    'pages/all': 'pages_all',
    'pages/add': 'pages_add',
    'pages_all': 'pages_all',
    'pages_add': 'pages_add',
    'users': 'users_all',
    'users/all': 'users_all',
    'users/add': 'users_add',
    'users_all': 'users_all',
    'users_add': 'users_add',
    'comments': 'comments',
    'navigation': 'navigation',
    'videos': 'videos',
    'newsletter': 'newsletter',
    'advertisements': 'advertisements',
    'ads': 'advertisements',
    'activity_logs': 'activity_logs',
    'activity-logs': 'activity_logs',
    'notifications': 'notifications',
    'trash': 'trash',
    'profile': 'profile',
    'settings': 'settings',
  };

  return routeMap[path] || 'dashboard';
}

export default async function AdminNestedRoutePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  // Server-side authentication and role verification before rendering any nested admin content
  const user = await getCurrentUser();

  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    notFound();
  }

  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const initialRoute = mapSlugToRouteId(slug);

  return <AdminDashboardClient initialUser={user} initialRoute={initialRoute} />;
}
