import { redirect } from 'next/navigation';

export default function AuthorNewPostRedirect() {
  redirect('/author/posts/all-posts/add-post');
}
