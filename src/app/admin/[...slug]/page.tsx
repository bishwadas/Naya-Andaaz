import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = slug.join('/').toLowerCase();

  const redirects: Record<string, string> = {
    'posts': '/admin/posts/all-posts',
    'posts/all': '/admin/posts/all-posts',
    'posts/add': '/admin/posts/add-post',
    'categories': '/admin/posts/categories',
    'tags': '/admin/posts/tags',
    'media': '/admin/media',
    'pages': '/admin/pages/all-pages',
    'pages/all': '/admin/pages/all-pages',
    'pages/add': '/admin/pages/new',
    'users': '/admin/users',
    'users/all': '/admin/users',
    'users/add': '/admin/users/add-user',
    'comments': '/admin/comments',
    'navigation': '/admin/navigation',
    'videos': '/admin/videos',
    'newsletter': '/admin/newsletter',
    'advertisements': '/admin/advertisements',
    'ads': '/admin/advertisements',
    'activity_logs': '/admin/activity-logs',
    'activity-logs': '/admin/activity-logs',
    'notifications': '/admin/notifications',
    'trash': '/admin/trash',
    'profile': '/admin/profile',
    'settings': '/admin/settings',
    'dashboard': '/admin/dashboard',
  };

  if (redirects[path]) {
    redirect(redirects[path]);
  }

  notFound();
}
