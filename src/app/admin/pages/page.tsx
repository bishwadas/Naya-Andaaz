import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminPagesIndexPage() {
  redirect('/admin/pages/all-pages');
}
