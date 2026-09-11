import { notFound, permanentRedirect } from 'next/navigation';
import { getPostBySlug } from '@/db/repository';

export const dynamic = 'force-dynamic';

export default async function ArticleRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const subCatSlug = post.subCategory?.slug || post.category?.slug || 'uncategorized';
  permanentRedirect(`/${subCatSlug}/${post.slug}`);
}

