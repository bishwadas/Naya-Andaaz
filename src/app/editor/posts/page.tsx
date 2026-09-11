import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EditorPostsIndexPage() {
  redirect('/editor/posts/all-posts');
}
