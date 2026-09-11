'use client';

import React from 'react';
import Link from 'next/link';
import { Post, SiteSettings, Category } from '@/types';
import { Block, sanitizeHtml } from '@/lib/blocks';
import { generateArticleJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd } from '@/lib/seo';
import { MoreForYouSection } from './MoreForYouSection';
import { ArticleActions } from './ArticleActions';
import { CommentSection } from './CommentSection';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Clock, Tag, MessageCircle } from 'lucide-react';
import { getCategoryUrl, getPostCategoryUrl } from '@/lib/categories';
import { getTagUrl, getAuthorUrl } from '@/lib/urls';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';

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

  const articleSchema = generateArticleJsonLd(post, settings);
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    ...(post.category ? [{ name: post.category.name, path: getCategoryUrl(post.category, categories) }] : []),
    ...(post.subCategory ? [{ name: post.subCategory.name, path: getPostCategoryUrl(post, categories) }] : []),
    { name: post.title, path: `/${post.subCategory?.slug || post.category?.slug || 'uncategorized'}/${post.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbJsonLd(breadcrumbItems, settings);

  // Extract FAQs from structured post.faqs or embedded FAQ blocks for rich snippet indexing
  const rawFaqs: Array<{ question: string; answer: string }> = [];
  if (Array.isArray(post.faqs)) {
    for (const f of post.faqs) {
      if (f?.question && f?.answer) {
        rawFaqs.push({ question: f.question, answer: f.answer });
      }
    }
  }
  if (Array.isArray(post.blocks)) {
    for (const b of post.blocks) {
      if (b?.type === 'faq' && Array.isArray(b.items)) {
        for (const item of b.items) {
          if (item?.question && item?.answer) {
            rawFaqs.push({ question: item.question, answer: item.answer });
          }
        }
      }
    }
  }
  const faqSchema = rawFaqs.length > 0 ? generateFaqJsonLd(rawFaqs) : null;

  return (
    <div className="w-full bg-white min-h-screen text-stone-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      {settings && categories && (
        <Navbar
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems || []}
        />
      )}

      {/* 1. Breadcrumbs Navigation (Mobile single line, truncated with ellipsis, never wraps) */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            id="article-breadcrumbs"
            aria-label="Breadcrumbs"
            className="breadcrumb-page-main w-full py-3 text-xs sm:text-sm text-stone-600 font-medium flex items-center flex-nowrap overflow-hidden whitespace-nowrap gap-1.5 text-ellipsis"
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
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 lg:items-start w-full mx-auto">
          {/* LEFT / PRIMARY COLUMN: ARTICLE (Desktop: col-span-8, Mobile/Tablet: 100% width) */}
          <article className="w-full lg:col-span-8 bg-white">
            
            {/* Featured Hero Media (Exact 1050px x 586px ratio - edge-to-edge on mobile) */}
            {post.featuredImage && (() => {
              const optimizedHero = getOptimizedImageUrl(post.featuredImage, 1050);
              const heroSrcSet = getResponsiveImageSrcSet(post.featuredImage, [360, 640, 960, 1050, 1200]);
              return (
                <figure className="-mx-4 sm:mx-0 relative w-auto sm:w-full rounded-none overflow-hidden bg-stone-100 border-0 sm:border sm:border-stone-200 sm:border-b-0 mb-0">
                  <img
                    src={optimizedHero}
                    srcSet={heroSrcSet}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1050px"
                    alt={post.title}
                    width={1050}
                    height={586}
                    className="w-full h-auto max-h-[586px] aspect-[1050/586] object-cover rounded-none block"
                    loading="eager"
                    decoding="sync"
                    // @ts-ignore
                    fetchPriority="high"
                  />
                </figure>
              );
            })()}

            {/* Header: Vibrant Pink Banner immediately beneath Featured Image - edge-to-edge on mobile */}
            <header className="-mx-4 sm:mx-0 w-auto sm:w-full bg-[#d80064] text-white px-4 py-5 sm:p-7 rounded-none shadow-none space-y-4 mb-6">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight font-serif tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-sm sm:text-base text-pink-50/95 font-serif leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Author & Meta Row */}
              <div className="pt-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-pink-400/40">
                <Link
                  href={getAuthorUrl(post.author || post.authorId)}
                  className="flex items-center gap-3 group shrink-0"
                >
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-none"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white text-[#d80064] border-2 border-white flex items-center justify-center font-bold text-sm">
                      {post.author?.name ? post.author.name.charAt(0) : 'N'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-sm">
                      {post.author?.name || 'Staff Writer'}
                    </div>
                    <div className="text-xs text-pink-100/90 flex items-center gap-2 mt-0.5">
                      <span>Published: {formattedDateStr}</span>
                    </div>
                  </div>
                </Link>

                {/* Actions: Share, Heart, Bookmark, Google News Badge */}
                <ArticleActions
                  postTitle={post.title}
                  postUrl={typeof window !== 'undefined' ? window.location.href : `/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                  postId={post.id}
                />
              </div>
            </header>

            {/* Article Body Content with Responsive Recommendations Placement */}
            <div
              id="article-content-body"
              className="text-stone-800 leading-relaxed font-serif text-base sm:text-lg space-y-6 pt-2 bg-white"
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

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#EC008C]" />
                    Tags:
                  </span>
                  {post.tags.map((tagItem: any) => {
                    const tagObj =
                      typeof tagItem === 'string'
                        ? {
                            name: tagItem.replace(/^#+/, ''),
                            slug: tagItem
                              .toLowerCase()
                              .replace(/^#+/, '')
                              .replace(/[^a-z0-9-_]+/g, '-')
                              .replace(/(^-|-$)+/g, ''),
                          }
                        : {
                            ...tagItem,
                            name: tagItem.name ? tagItem.name.replace(/^#+/, '') : '',
                          };
                    return (
                      <Link
                        key={tagObj.id || tagObj.slug}
                        href={getTagUrl(tagObj)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 hover:bg-pink-50 hover:text-[#EC008C] hover:border-pink-200 border border-stone-200 transition-colors"
                      >
                        {tagObj.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

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
        href={`/${targetPost.subCategory?.slug || 'uncategorized'}/${targetPost.slug}`}
        className="group block bg-white border border-stone-200 rounded-none sm:rounded-sm p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-pink-300 transition-all duration-200"
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {targetPost.featuredImage ? (
            <div className="w-28 h-20 sm:w-40 sm:h-28 rounded-none overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              <img
                src={targetPost.featuredImage}
                alt={targetPost.title}
                className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-28 h-20 sm:w-40 sm:h-28 rounded-none bg-stone-100 shrink-0 flex items-center justify-center text-stone-400 text-xs border border-stone-200">
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
function RenderBlock({ block, allBlocks = [] }: { block: Block; allBlocks?: Block[] }) {
  switch (block.type) {
    case 'table-of-contents':
      return <TableOfContentsBlock allBlocks={allBlocks} />;

    case 'alsoRead':
      return <AlsoReadBlock block={block} />;

    case 'faq':
      return <FaqBlock block={block} />;

    case 'paragraph':
      return (
        <p
          className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif"
          style={{ textAlign: block.attrs?.align || 'left' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );

    case 'heading-h2': {
      const headingId = `heading-${block.id}`;
      return (
        <h2
          id={headingId}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4 scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'heading-h3': {
      const headingId = `heading-${block.id}`;
      return (
        <h3
          id={headingId}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3 scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'heading-h4': {
      const headingId = `heading-${block.id}`;
      return (
        <h4
          id={headingId}
          style={{ textAlign: block.attrs?.align || 'left' }}
          className="text-lg sm:text-xl font-bold font-serif text-stone-800 mt-5 mb-2 scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'table': {
      const tbl = block.attrs?.tableData;
      if (tbl && tbl.rows) {
        return (
          <div className="my-6 overflow-x-auto rounded-none border border-stone-200 shadow-none bg-white">
            <table className="w-full text-left border-collapse text-sm">
              {tbl.headers && tbl.headers.length > 0 && tbl.hasHeader !== false && (
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {tbl.headers.map((h, hi) => (
                      <th key={hi} className="px-4 py-3 font-semibold text-stone-900" dangerouslySetInnerHTML={{ __html: sanitizeHtml(h) }} />
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-stone-100">
                {tbl.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-stone-50/60 transition">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-stone-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <div
          className="my-6 overflow-x-auto prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
        />
      );
    }

    case 'audio': {
      const audioUrl = block.attrs?.audioUrl || block.attrs?.url;
      return (
        <div className="my-6 p-4 rounded-none bg-stone-50 border border-stone-200 shadow-none">
          {(block.attrs?.audioTitle || block.attrs?.audioArtist) && (
            <div className="mb-3">
              {block.attrs.audioTitle && <p className="font-semibold text-stone-900 text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.attrs.audioTitle) }} />}
              {block.attrs.audioArtist && <p className="text-xs text-stone-500" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.attrs.audioArtist) }} />}
            </div>
          )}
          <audio controls src={audioUrl} className="w-full h-10 rounded-none">
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    case 'image':
      return (
        <figure className="my-8 w-full max-w-full block bg-transparent border-0 shadow-none p-0">
          <img
            src={
              block.attrs?.url
                ? getOptimizedImageUrl(block.attrs.url, 800)
                : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
            }
            alt={block.attrs?.alt || ''}
            className="w-full h-auto max-w-full rounded-none block"
            loading="lazy"
            decoding="async"
          />
          {block.attrs?.caption && (
            <figcaption className="text-center text-xs text-stone-500 mt-2 font-sans" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.attrs.caption) }} />
          )}
        </figure>
      );

    case 'gallery':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-8">
          {(block.attrs?.images || []).map((img: any, i: number) => (
            <figure
              key={i}
              className="gallery-item-figure rounded-none overflow-hidden border border-stone-200 bg-white shadow-none p-1"
            >
              <img
                src={getOptimizedImageUrl(img.url, 400)}
                alt=""
                width={400}
                height={260}
                loading="lazy"
                decoding="async"
                className="gallery-item-img w-full h-28 sm:h-36 object-cover rounded-none"
              />
              {img.caption && (
                <figcaption className="text-[10px] text-stone-500 mt-1 text-center" dangerouslySetInnerHTML={{ __html: sanitizeHtml(img.caption) }} />
              )}
            </figure>
          ))}
        </div>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-[#d80064] pl-4 py-2 italic text-lg text-stone-700 bg-pink-50/40 my-6 rounded-none">
          <p className="mb-2 font-serif" dangerouslySetInnerHTML={{ __html: `"` + sanitizeHtml(block.content || '') + `"` }} />
          {block.attrs?.author && (
            <cite className="text-xs text-stone-500 not-italic block font-sans font-semibold" dangerouslySetInnerHTML={{ __html: '— ' + sanitizeHtml(block.attrs.author) }} />
          )}
        </blockquote>
      );

    case 'list-bullet':
      return (
        <ul className="list-disc pl-6 space-y-2 my-4 text-stone-800 font-serif">
          {(block.content || '')
            .split('\n')
            .filter(Boolean)
            .map((li, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(li) }} />
            ))}
        </ul>
      );

    case 'list-number':
      return (
        <ol className="list-decimal pl-6 space-y-2 my-4 text-stone-800 font-serif">
          {(block.content || '')
            .split('\n')
            .filter(Boolean)
            .map((li, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(li) }} />
            ))}
        </ol>
      );

    case 'divider':
    case 'separator':
      return <hr className="my-8 border-t border-stone-200" />;

    case 'spacer':
      return <div style={{ height: `${block.attrs?.height || 32}px` }} aria-hidden="true" />;

    case 'video':
      return (
        <div className="rounded-none overflow-hidden shadow-none border border-stone-200 my-8">
          <video
            controls
            src={block.attrs?.url}
            className="w-full h-auto max-h-[460px] rounded-none"
          />
        </div>
      );

    case 'youtube':
      return block.attrs?.youtubeId ? (
        <div className="relative aspect-video rounded-none overflow-hidden shadow-none border border-stone-200 my-8">
          <iframe
            src={`https://www.youtube.com/embed/${block.attrs.youtubeId}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;

    case 'embed': {
      const eUrl = block.attrs?.embedUrl || block.attrs?.url;
      const eHtml = block.attrs?.embedHtml;
      if (eHtml) {
        return (
          <div
            className="my-8 overflow-hidden rounded-none border border-stone-200 shadow-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(eHtml) }}
          />
        );
      }
      if (!eUrl) return null;
      if (eUrl.includes('youtube.com') || eUrl.includes('youtu.be')) {
        const vidMatch = eUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const yid = vidMatch ? vidMatch[1] : '';
        return (
          <div className="relative aspect-video rounded-none overflow-hidden shadow-none border border-stone-200 my-8">
            <iframe
              src={`https://www.youtube.com/embed/${yid}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div className="my-8 rounded-none overflow-hidden border border-stone-200 shadow-none aspect-video">
          <iframe src={eUrl} className="w-full h-full" loading="lazy" />
        </div>
      );
    }

    case 'link':
      return (
        <p className="font-serif">
          <a
            href={block.attrs?.linkUrl || '#'}
            className="text-pink-600 hover:underline font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.attrs?.linkText || block.content || 'Link') }}
          />
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
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.attrs?.buttonText || block.content || 'Button') }}
          />
        </div>
      );

    case 'buttons': {
      const btns = block.attrs?.buttons || [];
      const align = block.attrs?.buttonAlign || 'left';
      return (
        <div
          className={`my-6 flex flex-wrap gap-3 justify-${
            align === 'center' ? 'center' : align === 'right' ? 'end' : 'start'
          }`}
        >
          {btns.map((btn, bi) => (
            <a
              key={bi}
              href={btn.url || '#'}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition shadow-sm ${
                btn.style === 'outline'
                  ? 'border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'
                  : btn.style === 'secondary'
                  ? 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                  : 'bg-pink-600 hover:bg-pink-700 text-white'
              }`}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(btn.text || 'Button') }}
            />
          ))}
        </div>
      );
    }

    case 'columns': {
      const cols = block.attrs?.columns || [];
      return (
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cols.map((col, ci) => (
            <div key={ci} className="space-y-4">
              {(col.blocks || []).map((b) => (
                <RenderBlock key={b.id} block={b} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    case 'code':
      return (
        <pre className="my-6 p-4 bg-stone-900 text-stone-100 rounded-none overflow-x-auto text-sm font-mono">
          <code className={`language-${block.attrs?.language || 'plaintext'}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }} />
        </pre>
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
