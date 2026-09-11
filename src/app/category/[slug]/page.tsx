import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cleanSlug = (slug || '').toLowerCase().trim();
  if (cleanSlug === 'food-wine' || cleanSlug === 'food') {
    permanentRedirect('/food-wine');
  }
  if (cleanSlug === 'relationships') {
    permanentRedirect('/relationship');
  }
  permanentRedirect(`/${cleanSlug}`);
}
