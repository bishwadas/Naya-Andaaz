import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminPostsIndexPage() {
  redirect('/admin/posts/all-posts');
}
