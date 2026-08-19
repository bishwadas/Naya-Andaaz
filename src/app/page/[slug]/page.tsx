import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getPageBySlug, getSettings, getPrimaryMenuItems } from '@/db/repository';
import { SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaticCustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, categories, settings, primaryMenuItems] = await Promise.all([
    getPageBySlug(slug),
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPrimaryMenuItems(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gazette
        </Link>

        <article className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 shadow-sm space-y-6">
          <header className="border-b border-stone-200 pb-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-950">
              {page.title}
            </h1>
            <div className="text-xs text-stone-500 mt-2">
              Published on {new Date(page.publishedAt).toLocaleDateString()}
            </div>
          </header>

          {page.featuredImage && (
            <div className="rounded-xl overflow-hidden bg-stone-100 max-h-96">
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-stone max-w-none font-serif text-stone-800 leading-relaxed space-y-4">
            {page.content ? (
              page.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p>No content published on this page yet.</p>
            )}
          </div>
        </article>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
