import { redirect } from 'next/navigation';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getPosts } from '@/db/repository';
import { EditorLayoutClient } from '@/components/editor/EditorLayoutClient';

export const dynamic = 'force-dynamic';

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?redirect=/editor');
  }

  if (!hasPermission(user.role, 'EDITOR')) {
    if (user.role?.toUpperCase() === 'AUTHOR') {
      redirect('/author');
    }
    redirect('/?error=editor_required');
  }

  const allPosts = await getPosts({ limit: 500 });
  const pendingReviewCount = allPosts.filter((p) => p.status === 'pending').length;

  return (
    <EditorLayoutClient user={user} pendingReviewCount={pendingReviewCount}>
      {children}
    </EditorLayoutClient>
  );
}

