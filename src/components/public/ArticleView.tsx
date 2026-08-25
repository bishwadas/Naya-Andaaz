'use client';

import React from 'react';
import Link from 'next/link';
import { Post, SiteSettings, Category } from '@/types';
import { Block, sanitizeHtml } from '@/lib/blocks';
import { MoreForYouSection } from './MoreForYouSection';
import { ArticleActions } from './ArticleActions';
import { CommentSection } from './CommentSection';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Clock, Tag, MessageCircle } from 'lucide-react';
import { getCategoryUrl, getPostCategoryUrl } from '@/lib/categories';
import { getTagUrl, getAuthorUrl } from '@/lib/urls';

interface ArticleViewProps {
  post: Post;
  recommendations: Post[];
  settings?: SiteSettings;
  categories?: Category[];
  primaryMenuItems?: any[];
}

export function ArticleView({
  post,
  recommendations,
  settings,
  categories,
  primaryMenuItems,
}: ArticleViewProps) {
  // Format publication date nicely
  const displayDate = post.publishedAt || post.createdAt;
  const formattedDateStr = displayDate
    ? new Date(displayDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }) + ' IST'
    : '';

  // Calculate split point for inline recommendations (35-50% mark)
  const blocks = (post.blocks as Block[]) || [];
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const blockSplitIndex = hasBlocks
    ? Math.max(1, Math.min(blocks.length - 1, Math.floor(blocks.length * 0.42)))
    : 0;

  return (
    <div className="w-full bg-white min-h-screen text-stone-900 font-sans">
      {settings && categories && (
        <Navbar
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems || []}
        />
      )}

      {/* 1. Breadcrumbs Navigation (Mobile single line, truncated with ellipsis, never wraps) */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            id="article-breadcrumbs"
            aria-label="Breadcrumbs"
            className="breadcrumb-page-main max-w-6xl mx-auto py-3 text-xs sm:text-sm text-stone-600 font-medium flex items-center flex-nowrap overflow-hidden whitespace-nowrap gap-1.5 text-ellipsis"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-pink-600 transition shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {post.category ? (
              <>
                <Link
                  href={getCategoryUrl(post.category, categories)}
                  className="hover:text-pink-600 transition shrink-0"
                >
                  {post.category.name}
                </Link>
                {post.subCategory && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <Link
                      href={getPostCategoryUrl(post, categories)}
                      className="hover:text-pink-600 transition shrink-0"
                    >
                      {post.subCategory.name}
                    </Link>
                  </>
                )}
              </>
            ) : (
              <span className="shrink-0">Editorial</span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-stone-800 font-semibold truncate">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Main Responsive Article Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start max-w-6xl mx-auto">
          {/* LEFT / PRIMARY COLUMN: ARTICLE (Desktop: col-span-8, Mobile/Tablet: 100% width) */}
          <article className="w-full lg:col-span-8 space-y-6 bg-white">
            
            {/* Featured Hero Media (placed ABOVE title matching reference image) */}
            {post.featuredImage && (
              <figure className="relative w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200 mb-6">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto max-h-[480px] object-cover"
                />
                {post.featuredImageCaption && (
                  <figcaption className="p-3 text-xs text-stone-500 bg-stone-50 italic text-center border-t border-stone-200">
                    {post.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Header: Category Badge, Title, Excerpt, Author Meta */}
            <header className="space-y-4">
              {/* Category Badge matching screenshot: pink uppercase pill */}
              {post.category && (
                <div className="flex items-center gap-2">
                  <Link
                    href={getCategoryUrl(post.category, categories)}
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-pink-600 bg-[#fef2f6] px-3 py-1 rounded-full border border-pink-200 hover:bg-pink-100 transition-colors"
                  >
                    {post.subCategory ? post.subCategory.name : post.category.name}
                  </Link>
                </div>
              )}

              {/* Title matching screenshot typography */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight font-serif tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-base sm:text-lg text-stone-600 font-serif leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Author & Meta Bar */}
              <div className="pt-3 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link
                  href={getAuthorUrl(post.author || post.authorId)}
                  className="flex items-center gap-3 group"
                >
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-xs group-hover:border-pink-500 transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 border border-pink-200 flex items-center justify-center font-bold text-sm group-hover:bg-pink-200 transition-colors">
                      {post.author?.name ? post.author.name.charAt(0) : 'B'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-stone-900 text-sm group-hover:text-pink-600 transition-colors">
                      {post.author?.name || 'Staff Writer'}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>Published on {formattedDateStr}</span>
                      <span>•</span>
                      <span>{post.readingTime || 12} min read</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Share Bar matching screenshot */}
              <div className="flex items-center gap-3 pt-2 pb-2">
                <span className="text-xs font-bold text-stone-700">Share:</span>
                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${typeof window !== 'undefined' ? window.location.href : post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on WhatsApp"
                    className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : post.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                    className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition shadow-xs"
                  >
                    f
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : post.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                    className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs hover:opacity-90 transition shadow-xs"
                  >
                    𝕏
                  </a>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : post.slug);
                      alert('Link copied to clipboard!');
                    }}
                    aria-label="Copy link"
                    className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-200 transition shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Article Body Content with Responsive Recommendations Placement */}
            <div
              id="article-content-body"
              className="text-stone-800 leading-relaxed font-serif text-base sm:text-lg space-y-6 pt-2"
            >
              {hasBlocks ? (
                <>
                  {/* First 35-50% of Blocks */}
                  {blocks.slice(0, blockSplitIndex).map((block) => (
                    <RenderBlock key={block.id} block={block} allBlocks={blocks} />
                  ))}

                  {/* INLINE "MORE FOR YOU" (Rendered ONLY on Tablet & Mobile, hidden on Desktop) */}
                  <MoreForYouSection
                    posts={recommendations}
                    className="block lg:hidden my-8"
                    isSidebar={false}
                  />

                  {/* Remaining 50-65% of Blocks */}
                  {blocks.slice(blockSplitIndex).map((block) => (
                    <RenderBlock key={block.id} block={block} allBlocks={blocks} />
                  ))}
                </>
              ) : post.content ? (
                <RenderHtmlOrTextContent
                  content={post.content}
                  recommendations={recommendations}
                />
              ) : (
                <p className="text-stone-600">No article content available.</p>
              )}
            </div>



            {/* Comments */}
            {post.allowComments !== false && (
              <div className="mt-10 pt-8 border-t border-stone-200">
                <CommentSection postId={post.id} />
              </div>
            )}
          </article>

          {/* RIGHT COLUMN: STICKY "MORE FOR YOU" SIDEBAR (Desktop only) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start space-y-6">
            <MoreForYouSection
              posts={recommendations}
              title="MORE FOR YOU"
              isSidebar={true}
            />
          </div>
        </div>
      </main>
      {settings && categories && <Footer settings={settings} categories={categories} />}
    </div>
  );
}

/**
 * Editor-controlled Table of Contents Block matching reference image styling
 */
function TableOfContentsBlock({ allBlocks }: { allBlocks: Block[] }) {
  const [isOpen, setIsOpen] = React.useState(true);

  const headings = allBlocks
    .filter((b) => b.type === 'heading-h2' || b.type === 'heading-h3')
    .map((b) => ({
      id: `heading-${b.id}`,
      type: b.type,
      text: b.content,
    }));

  if (headings.length === 0) {
    return (
      <div className="bg-[#fef2f6] border border-pink-100 rounded-2xl p-5 my-6 text-stone-500 text-sm">
        <span className="font-bold text-stone-900 block mb-1">In This Article</span>
        <p className="text-xs">No headings (H2/H3) found in this article yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fef2f6] border border-pink-100 rounded-2xl p-5 sm:p-6 my-6 shadow-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 mb-4">
        <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
          In This Article
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-stone-500 hover:text-stone-800 transition p-1"
          aria-expanded={isOpen}
          aria-label="Toggle Table of Contents"
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className="space-y-3 text-xs sm:text-sm font-medium">
          {headings.map((h) => (
            <li
              key={h.id}
              className={`${h.type === 'heading-h3' ? 'ml-4' : ''} text-stone-800 flex items-center gap-2`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0"></span>
              <a
                href={`#${h.id}`}
                className="hover:text-pink-700 hover:underline transition-colors block truncate"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqBlock({ block }: { block: Block }) {
  const items = block.items || block.attrs?.items || [];
  const [openIndex, setOpenIndex] = React.useState<number | null>(0); // First item open by default

  if (items.length === 0) return null;

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="my-10 font-sans">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-full border border-[#db2777] text-[#db2777] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-950 tracking-tight">
            Frequently Asked Questions
          </h3>
          <div className="w-12 h-1 bg-[#db2777] mt-1.5"></div>
        </div>
      </div>

      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`faq-${idx}`}
              className="bg-white border border-stone-200/95 rounded-2xl shadow-2xs overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-serif font-bold text-stone-900 hover:text-[#db2777] transition-colors focus:outline-none"
              >
                <span className={`text-base sm:text-lg ${isOpen ? 'text-[#db2777]' : 'text-stone-900'}`}>
                  {idx + 1}. {item.question}
                </span>
                <span className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#db2777] shrink-0 ml-3 transition-transform duration-200">
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-0 text-stone-700 text-sm sm:text-base leading-relaxed border-t border-stone-100 mt-1 pt-4 font-sans">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlsoReadBlock({ block }: { block: Block }) {
  const [targetPost, setTargetPost] = React.useState<Post | null>(null);
  const targetPostId = block.postId || block.attrs?.postId;

  React.useEffect(() => {
    if (!targetPostId) return;
    fetch(`/api/posts/${targetPostId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTargetPost(data);
        }
      })
      .catch(() => {});
  }, [targetPostId]);

  if (!targetPostId) return null;

  if (!targetPost) {
    return (
      <div className="my-8 font-sans">
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">
            ALSO READ
          </h3>
          <div className="w-12 h-1 bg-[#db2777] mt-1.5"></div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-400">
          Loading recommended article...
        </div>
      </div>
    );
  }

  const cat = targetPost.subCategory || targetPost.category;

  return (
    <div className="my-8 font-sans">
      <div className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">
          ALSO READ
        </h3>
        <div className="w-12 h-1 bg-[#db2777] mt-1.5"></div>
      </div>

      <Link
        href={`/${targetPost.slug}`}
        className="group block bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-pink-300 transition-all duration-200"
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {targetPost.featuredImage ? (
            <div className="w-28 h-20 sm:w-40 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
              <img
                src={targetPost.featuredImage}
                alt={targetPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-28 h-20 sm:w-40 sm:h-28 rounded-xl bg-stone-100 shrink-0 flex items-center justify-center text-stone-400 text-xs">
              No Image
            </div>
          )}

          <div className="flex-1 min-w-0 py-1">
            {cat && (
              <span className="text-[11px] sm:text-xs font-bold text-[#db2777] uppercase tracking-wider block mb-1">
                {cat.name}
              </span>
            )}
            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base md:text-lg leading-snug group-hover:text-pink-700 transition-colors line-clamp-2">
              {targetPost.title}
            </h4>
          </div>

          <div className="hidden sm:flex items-center gap-6 shrink-0 pl-2">
            <div className="w-px h-12 bg-stone-200"></div>
            <div className="w-10 h-10 rounded-full border border-[#db2777] text-[#db2777] flex items-center justify-center group-hover:bg-[#db2777] group-hover:text-white transition-all duration-200 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-[#db2777] text-[#db2777] shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * Atomic Block Renderer for Gutenberg/Wordpress-style Blocks
 */
function RenderBlock({ block, allBlocks }: { block: Block; allBlocks: Block[] }) {
  switch (block.type) {
    case 'table-of-contents':
      return <TableOfContentsBlock allBlocks={allBlocks} />;

    case 'alsoRead':
      return <AlsoReadBlock block={block} />;

    case 'faq':
      return <FaqBlock block={block} />;

    case 'paragraph':
      return (
        <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
          {block.content}
        </p>
      );

    case 'heading-h2': {
      const headingId = `heading-${block.id}`;
      return (
        <h2 id={headingId} className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4 scroll-mt-24">
          {block.content}
        </h2>
      );
    }

    case 'heading-h3': {
      const headingId = `heading-${block.id}`;
      return (
        <h3 id={headingId} className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3 scroll-mt-24">
          {block.content}
        </h3>
      );
    }

    case 'image':
      return (
        <figure className="my-8 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 p-1 shadow-sm">
          <img
            src={
              block.attrs?.url ||
              'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
            }
            alt={block.attrs?.alt || ''}
            className="w-full h-auto rounded-xl object-cover"
          />
          {block.attrs?.caption && (
            <figcaption className="text-center text-xs text-stone-500 italic mt-2.5 px-2">
              {block.attrs.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-8">
          {(block.attrs?.images || []).map((img: any, i: number) => (
            <figure
              key={i}
              className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs p-1"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-28 sm:h-36 object-cover rounded-lg"
              />
              {img.caption && (
                <figcaption className="text-[10px] text-stone-500 italic text-center mt-1 truncate">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-pink-500 pl-4 py-2 italic text-lg text-stone-700 bg-pink-50/40 my-6 rounded-r-xl">
          <p className="mb-2 font-serif">"{block.content}"</p>
          {block.attrs?.author && (
            <cite className="text-xs text-stone-500 not-italic block font-sans font-semibold">
              — {block.attrs.author}
            </cite>
          )}
        </blockquote>
      );

    case 'list-bullet':
      return (
        <ul className="list-disc pl-6 space-y-2 my-4 text-stone-800 font-serif">
          {block.content
            .split('\n')
            .filter(Boolean)
            .map((li, idx) => (
              <li key={idx}>{li}</li>
            ))}
        </ul>
      );

    case 'list-number':
      return (
        <ol className="list-decimal pl-6 space-y-2 my-4 text-stone-800 font-serif">
          {block.content
            .split('\n')
            .filter(Boolean)
            .map((li, idx) => (
              <li key={idx}>{li}</li>
            ))}
        </ol>
      );

    case 'divider':
      return <hr className="my-8 border-t border-stone-200" />;

    case 'video':
      return (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 my-8">
          <video
            controls
            src={block.attrs?.url}
            className="w-full h-auto max-h-[420px]"
          />
        </div>
      );

    case 'youtube':
      return block.attrs?.youtubeId ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-stone-200 my-8">
          <iframe
            src={`https://www.youtube.com/embed/${block.attrs.youtubeId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;

    case 'link':
      return (
        <p className="font-serif">
          <a
            href={block.attrs?.linkUrl || '#'}
            className="text-pink-600 hover:underline font-semibold"
          >
            {block.attrs?.linkText || block.content || 'Link'}
          </a>
        </p>
      );

    case 'button':
      return (
        <div
          className={`my-6 flex justify-${
            block.attrs?.buttonAlign === 'center'
              ? 'center'
              : block.attrs?.buttonAlign === 'right'
              ? 'end'
              : 'start'
          }`}
        >
          <a
            href={block.attrs?.buttonUrl || '#'}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition shadow-sm ${
              block.attrs?.buttonStyle === 'outline'
                ? 'border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'
                : block.attrs?.buttonStyle === 'secondary'
                ? 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {block.attrs?.buttonText || block.content || 'Button'}
          </a>
        </div>
      );

    case 'html':
      return (
        <div
          className="my-6 p-4 bg-stone-50 border border-stone-200 rounded-xl"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
        />
      );

    default:
      return null;
  }
}

/**
 * Fallback Content Splitter & Renderer for HTML or Multi-Paragraph Plain Text
 */
function RenderHtmlOrTextContent({
  content,
  recommendations,
}: {
  content: string;
  recommendations: Post[];
}) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!isHtml) {
    const paragraphs = content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length <= 2) {
      return (
        <>
          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
              {p}
            </p>
          ))}
          <MoreForYouSection
            posts={recommendations}
            className="block lg:hidden my-8"
            isSidebar={false}
          />
        </>
      );
    }

    const splitIdx = Math.max(1, Math.floor(paragraphs.length * 0.42));
    const part1 = paragraphs.slice(0, splitIdx);
    const part2 = paragraphs.slice(splitIdx);

    return (
      <>
        {part1.map((p, idx) => (
          <p key={idx} className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
            {p}
          </p>
        ))}

        {/* INLINE RECOMMENDATIONS (Tablet & Mobile only) */}
        <MoreForYouSection
          posts={recommendations}
          className="block lg:hidden my-8"
          isSidebar={false}
        />

        {part2.map((p, idx) => (
          <p key={`p2-${idx}`} className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
            {p}
          </p>
        ))}
      </>
    );
  }

  // HTML content: split on major closing tags
  const tagBreakRegex = /(<\/p>|<\/h2>|<\/h3>|<\/figure>|<\/blockquote>|<\/div>)/gi;
  const segments: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tagBreakRegex.exec(content)) !== null) {
    const end = match.index + match[0].length;
    segments.push(content.substring(lastIndex, end));
    lastIndex = end;
  }
  if (lastIndex < content.length) {
    segments.push(content.substring(lastIndex));
  }

  if (segments.length <= 2) {
    return (
      <>
        <div
          className="prose-content space-y-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
        <MoreForYouSection
          posts={recommendations}
          className="block lg:hidden my-8"
          isSidebar={false}
        />
      </>
    );
  }

  const splitIdx = Math.max(1, Math.floor(segments.length * 0.42));
  const htmlPart1 = segments.slice(0, splitIdx).join('');
  const htmlPart2 = segments.slice(splitIdx).join('');

  return (
    <>
      <div
        className="prose-content space-y-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlPart1) }}
      />

      {/* INLINE RECOMMENDATIONS (Tablet & Mobile only) */}
      <MoreForYouSection
        posts={recommendations}
        className="block lg:hidden my-8"
        isSidebar={false}
      />

      <div
        className="prose-content space-y-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlPart2) }}
      />
    </>
  );
}
