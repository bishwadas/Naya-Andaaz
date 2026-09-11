import { redirect } from 'next/navigation';

export default function EditorNewPostRedirect() {
  redirect('/editor/posts/add-post');
}
