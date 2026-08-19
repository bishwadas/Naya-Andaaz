import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Block, sanitizeHtml } from '@/lib/blocks';
import {
  getCategories,
  getPostBySlug,
  getPosts,
  getTags,
  getSettings,
  getPrimaryMenuItems,
  incrementPostViews,
  getMostSearchedTerms
} from '@/db/repository';
import { filterPostsForCategoryTree } from '@/lib/categories';
import { SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { Clock, Eye, Calendar, ArrowLeft, Tag } from 'lucide-react';
import ParentCategoryView from '@/components/public/ParentCategoryView';
import SubCategoryArchiveView from '@/components/public/SubCategoryArchiveView';
import { TagArchiveView } from '@/components/public/TagArchiveView';

export const dynamic = 'force-dynamic';

const RESERVED_ROUTES = [
  'admin',
  'api',
  'login',
  'register',
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify-email',
  'search',
  'category',
  'article',
  'tags',
];

export default async function CleanUrlResolverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  if (RESERVED_ROUTES.includes(cleanSlug)) {
    notFound();
  }

  // 1. Check if it's an Article (Post)
  const post = await getPostBySlug(slug);
  if (post) {
    incrementPostViews(slug).catch(() => {});
    const [categories, settings, recentPosts, primaryMenuItems] = await Promise.all([
      getCategories(),
      getSettings().then((s) => s as unknown as SiteSettings),
      getPosts({ status: 'published', limit: 4 }),
      getPrimaryMenuItems(),
    ]);
    const otherPosts = recentPosts.filter((p) => p.slug !== slug).slice(0, 3);

    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
        <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Gazette
            </Link>
            {post.category && (
              <Link
                href={`/${post.category.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full"
              >
                {post.category.name}
              </Link>
            )}
          </div>

          <header className="space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-950 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-serif italic border-l-4 border-amber-400 pl-4">
                {post.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200 text-xs text-stone-600">
              <div className="flex items-center gap-3">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700">
                    {post.author?.name ? post.author.name.charAt(0) : 'E'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-stone-900 text-sm">{post.author?.name || 'Editorial Team'}</div>
                  <div className="text-stone-500">{post.author?.bio || 'Staff Reporter'}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime || 4} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {post.views || 1} views
                </span>
              </div>
            </div>
          </header>

          {post.featuredImage && (
            <figure className="mb-10 rounded-2xl overflow-hidden bg-stone-100 shadow-md">
              <img src={post.featuredImage} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
              {post.featuredImageCaption && (
                <figcaption className="p-3 text-xs text-stone-500 bg-stone-100 italic text-center">
                  {post.featuredImageCaption}
                </figcaption>
              )}
            </figure>
          )}

          <article className="prose prose-stone prose-lg max-w-none text-stone-800 leading-relaxed font-serif space-y-6">
            {post.blocks && Array.isArray(post.blocks) && (post.blocks as Block[]).length > 0 ? (
              (post.blocks as Block[]).map((block) => {
                switch (block.type) {
                  case 'paragraph':
                    return (
                      <p key={block.id} className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
                        {block.content}
                      </p>
                    );
                  case 'heading-h2':
                    return (
                      <h2 key={block.id} className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4">
                        {block.content}
                      </h2>
                    );
                  case 'heading-h3':
                    return (
                      <h3 key={block.id} className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3">
                        {block.content}
                      </h3>
                    );
                  case 'image':
                    return (
                      <figure key={block.id} className="my-8 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 p-1">
                        <img
                          src={block.attrs?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                          alt={block.attrs?.alt || ''}
                          className="w-full h-auto rounded"
                        />
                        {block.attrs?.caption && (
                          <figcaption className="text-center text-xs text-stone-500 italic mt-2">{block.attrs.caption}</figcaption>
                        )}
                      </figure>
                    );
                  case 'gallery':
                    return (
                      <div key={block.id} className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-8">
                        {(block.attrs?.images || []).map((img: any, i: number) => (
                          <figure key={i} className="rounded overflow-hidden border border-stone-200 bg-white shadow-sm p-1">
                            <img src={img.url} alt="" className="w-full h-24 object-cover rounded" />
                            {img.caption && <figcaption className="text-[10px] text-stone-500 italic text-center mt-1 truncate">{img.caption}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    );
                  case 'quote':
                    return (
                      <blockquote key={block.id} className="border-l-4 border-amber-500 pl-4 py-1 italic text-lg text-stone-700 bg-stone-50 my-6 rounded-r">
                        <p className="mb-2">"{block.content}"</p>
                        {block.attrs?.author && (
                          <cite className="text-xs text-stone-500 not-italic block font-sans font-semibold">— {block.attrs.author}</cite>
                        )}
                      </blockquote>
                    );
                  case 'list-bullet':
                    return (
                      <ul key={block.id} className="list-disc pl-6 space-y-1.5 my-4">
                        {block.content.split('\n').filter(Boolean).map((li, idx) => (
                          <li key={idx} className="text-stone-800 font-serif">{li}</li>
                        ))}
                      </ul>
                    );
                  case 'list-number':
                    return (
                      <ol key={block.id} className="list-decimal pl-6 space-y-1.5 my-4">
                        {block.content.split('\n').filter(Boolean).map((li, idx) => (
                          <li key={idx} className="text-stone-800 font-serif">{li}</li>
                        ))}
                      </ol>
                    );
                  case 'divider':
                    return <hr key={block.id} className="my-8 border-t border-stone-200" />;
                  case 'video':
                    return (
                      <div key={block.id} className="rounded-xl overflow-hidden shadow border border-stone-200 my-8">
                        <video controls src={block.attrs?.url} className="w-full h-auto max-h-[400px]" />
                      </div>
                    );
                  case 'youtube':
                    return block.attrs?.youtubeId ? (
                      <div key={block.id} className="relative aspect-video rounded-xl overflow-hidden shadow border border-stone-200 my-8">
                        <iframe
                          src={`https://www.youtube.com/embed/${block.attrs.youtubeId}`}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : null;
                  case 'link':
                    return (
                      <p key={block.id} className="font-serif">
                        <a href={block.attrs?.linkUrl || '#'} className="text-amber-600 hover:underline hover:text-amber-700 font-medium">
                          {block.attrs?.linkText || block.content || 'Link'}
                        </a>
                      </p>
                    );
                  case 'button':
                    return (
                      <div key={block.id} className={`my-6 flex justify-${block.attrs?.buttonAlign === 'center' ? 'center' : block.attrs?.buttonAlign === 'right' ? 'end' : 'start'}`}>
                        <a
                          href={block.attrs?.buttonUrl || '#'}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition tracking-wide ${
                            block.attrs?.buttonStyle === 'outline'
                              ? 'border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white'
                              : block.attrs?.buttonStyle === 'secondary'
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                              : 'bg-pink-600 hover:bg-pink-700 text-white shadow hover:shadow-md'
                          }`}
                        >
                          {block.attrs?.buttonText || block.content || 'Button'}
                        </a>
                      </div>
                    );
                  case 'columns':
                    return (
                      <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        {(block.attrs?.columns || []).map((col: any, ci: number) => (
                          <div key={col.id} className="space-y-4">
                            {col.blocks.map((sub: Block) => (
                              <div key={sub.id} className="text-base text-stone-800 leading-relaxed font-serif">
                                {sub.type === 'paragraph' && <p>{sub.content}</p>}
                                {sub.type === 'heading-h2' && <h2 className="text-xl font-bold font-serif mt-4">{sub.content}</h2>}
                                {sub.type === 'heading-h3' && <h3 className="text-lg font-bold font-serif mt-3">{sub.content}</h3>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  case 'html':
                    return (
                      <div key={block.id} className="my-6 p-4 bg-stone-50 border border-stone-200 rounded-xl" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} />
                    );
                  default:
                    return null;
                }
              })
            ) : post.content ? (
              post.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base sm:text-lg leading-relaxed text-stone-800">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-stone-600">No article content available.</p>
            )}
          </article>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/${t.slug}`}
                  className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 hover:bg-amber-100 transition"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {otherPosts.length > 0 && (
            <section className="mt-14 pt-10 border-t border-stone-300">
              <h3 className="text-2xl font-serif font-bold text-stone-950 mb-6">More Stories from Sereia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/${related.slug}`}
                    className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition flex flex-col"
                  >
                    <div className="h-36 overflow-hidden bg-stone-100">
                      <img
                        src={related.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-600 transition line-clamp-2">
                        {related.title}
                      </h4>
                      <span className="text-[11px] text-stone-500 mt-2">
                        {related.publishedAt ? new Date(related.publishedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer settings={settings} categories={categories} />
      </div>
    );
  }

  // 2. Check if it's a Category or Sub-category
  const [categories, settings, allPosts, primaryMenuItems, tagsList, mostSearchedTerms] = await Promise.all([
    getCategories(),
    getSettings().then((s) => s as unknown as SiteSettings),
    getPosts({ status: 'published', limit: 250 }),
    getPrimaryMenuItems(),
    getTags(),
    getMostSearchedTerms(),
  ]);

  // A public category URL is a canonical database slug. Do not resolve it by
  // name, ID, stripped punctuation, or keyword: those fallbacks can select a
  // different category (for example, `/style` becoming Women & Lifestyle).
  const currentCategory = categories.find(
    (category) => category.slug.trim().toLowerCase() === cleanSlug
  );

  if (currentCategory) {
    const childCategories = categories.filter((c) => c.parentId === currentCategory?.id);
    const isParent = !currentCategory.parentId || childCategories.length > 0;
    const parentCat = currentCategory.parentId
      ? categories.find((c) => c.id === currentCategory?.parentId)
      : undefined;

    // Filter posts for current category AND all descendant categories in its tree
    const categoryPosts = filterPostsForCategoryTree(currentCategory, categories, allPosts);

    if (isParent) {
      return (
        <ParentCategoryView
          currentCategory={currentCategory}
          childCategories={childCategories}
          categoryPosts={categoryPosts}
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems}
        />
      );
    } else {
      return (
        <SubCategoryArchiveView
          currentCategory={currentCategory}
          parentCategory={parentCat}
          categoryPosts={categoryPosts}
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems}
          initialMostSearchedTerms={mostSearchedTerms}
        />
      );
    }
  }

  // 3. Check if it's a Tag
  const matchedTag = tagsList.find((t) => t.slug.toLowerCase() === cleanSlug);
  if (matchedTag) {
    const tagPosts = await getPosts({ tagSlug: matchedTag.slug, status: 'published', limit: 100 });
    return (
      <TagArchiveView
        tag={matchedTag}
        posts={tagPosts}
        categories={categories}
        settings={settings}
        primaryMenuItems={primaryMenuItems}
      />
    );
  }

  notFound();
}
