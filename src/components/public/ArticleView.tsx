import React from 'react';
import Link from 'next/link';
import { Post, SiteSettings, Category } from '@/types';
import { Block, sanitizeHtml } from '@/lib/blocks';
import { MoreForYouSection } from './MoreForYouSection';
import { ArticleActions } from './ArticleActions';
import { CommentSection } from './CommentSection';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Clock, Calendar, Eye, Tag } from 'lucide-react';
import { getCategoryUrl, getPostCategoryUrl } from '@/lib/categories';

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
  // Format publication/update date nicely
  const displayDate = post.updatedAt || post.publishedAt || post.createdAt;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';
  const formattedTime = displayDate
    ? new Date(displayDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  // Calculate split point for inline recommendations (35-50% mark)
  const blocks = (post.blocks as Block[]) || [];
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const blockSplitIndex = hasBlocks
    ? Math.max(1, Math.min(blocks.length - 1, Math.floor(blocks.length * 0.42)))
    : 0;

  return (
    <div className="w-full bg-stone-50 min-h-screen">
      {settings && categories && (
        <Navbar
          categories={categories}
          settings={settings}
          primaryMenuItems={primaryMenuItems || []}
        />
      )}
      {/* 1. Breadcrumbs Navigation */}
      <nav
        id="article-breadcrumbs"
        aria-label="Breadcrumbs"
        className="breadcrumb-page-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 text-xs sm:text-sm text-stone-600 font-medium flex items-center flex-wrap gap-2"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-[#db2777] transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        {post.category ? (
          <>
            <Link
              href={getCategoryUrl(post.category, categories)}
              className="hover:text-[#db2777] transition"
            >
              {post.category.name}
            </Link>
            {post.subCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <Link
                  href={getPostCategoryUrl(post, categories)}
                  className="hover:text-[#db2777] transition"
                >
                  {post.subCategory.name}
                </Link>
              </>
            )}
          </>
        ) : (
          <span>Editorial</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-[350px]">
          {post.title}
        </span>
      </nav>

      {/* 2. Main Responsive Article Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* LEFT / PRIMARY COLUMN: ARTICLE (Desktop: col-span-8, Mobile/Tablet: 100% width) */}
          <article className="w-full lg:col-span-8 space-y-6">
            {/* Top Featured Hero Media */}
            {post.featuredImage && (
              <figure className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 shadow-md">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto max-h-[480px] sm:max-h-[540px] object-cover"
                />
                {post.featuredImageCaption && (
                  <figcaption className="p-2.5 text-xs text-stone-400 bg-stone-900/90 italic text-center">
                    {post.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Vibrant Magenta Title & Meta Card matching screenshots */}
            <header
              id="article-hero-header"
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-md relative z-10"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight font-serif sm:font-sans">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-sm sm:text-base text-pink-100 font-normal leading-relaxed mt-3">
                  {post.excerpt}
                </p>
              )}

              {/* Meta & Social Action Toolbar */}
              <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-white text-sm">
                      {post.author?.name ? post.author.name.charAt(0) : 'E'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-sm">
                      {post.author?.name || 'Editorial Team'}
                    </div>
                    <div className="text-[11px] text-pink-200">
                      Updated: {formattedDate}
                      {formattedTime ? `, ${formattedTime} IST` : ''}
                    </div>
                  </div>
                </div>

                {/* Social Share & Action Buttons */}
                <ArticleActions
                  postTitle={post.title}
                  postUrl={
                    typeof window !== 'undefined'
                      ? window.location.href
                      : `/${post.slug}`
                  }
                  initialLikes={post.likes || 0}
                  postId={post.id}
                />
              </div>
            </header>

            {/* Quick reading stats */}
            <div className="flex items-center gap-4 text-xs text-stone-500 px-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                {post.readingTime || 4} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-pink-600" />
                {post.views || 1} views
              </span>
              {post.category && (
                <span className="ml-auto inline-block text-[11px] font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                  {post.category.name}
                </span>
              )}
            </div>

            {/* Article Body Content with Responsive Recommendations Placement */}
            <div
              id="article-content-body"
              className="text-stone-800 leading-relaxed font-serif text-base sm:text-lg space-y-6 pt-2"
            >
              {hasBlocks ? (
                <>
                  {/* First 35-50% of Blocks */}
                  {blocks.slice(0, blockSplitIndex).map((block) => (
                    <RenderBlock key={block.id} block={block} />
                  ))}

                  {/* INLINE "MORE FOR YOU" (Rendered ONLY on Tablet & Mobile, hidden on Desktop) */}
                  <MoreForYouSection
                    posts={recommendations}
                    className="block lg:hidden my-8"
                    isSidebar={false}
                  />

                  {/* Remaining 50-65% of Blocks */}
                  {blocks.slice(blockSplitIndex).map((block) => (
                    <RenderBlock key={block.id} block={block} />
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

            {/* Related Topics / Tags */}
            {post.tags && post.tags.length > 0 && (
              <div
                id="article-tags"
                className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Tag className="w-3.5 h-3.5 text-pink-600" /> Tags:
                </span>
                {post.tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/${t.slug}`}
                    className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 transition-colors"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Profile Bio Card */}
            {post.author && (
              <div className="mt-8 p-5 bg-stone-100 rounded-2xl border border-stone-200 flex items-start gap-4">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-14 h-14 rounded-full object-cover border border-stone-300 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-lg flex-shrink-0">
                    {post.author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Written by {post.author.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                    {post.author.bio ||
                      'Editorial contributor covering fashion, wellness, culture, and lifestyle narratives.'}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Comment Section */}
            {post.allowComments !== false && (
              <div className="mt-10 pt-8 border-t border-stone-200">
                <CommentSection postId={post.id} />
              </div>
            )}
          </article>

          {/* RIGHT COLUMN: STICKY "MORE FOR YOU" SIDEBAR (Desktop only: hidden on mobile/tablet) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start space-y-6">
            <MoreForYouSection
              posts={recommendations}
              title="MORE FOR YOU"
              isSidebar={true}
            />

            {/* Category / Trending Highlights in Sidebar */}
            {categories && categories.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-3 border-b border-stone-200 mb-3">
                  Explore Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={getCategoryUrl(cat, categories)}
                      className="text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:border-pink-400 hover:text-pink-600 px-2.5 py-1 rounded-full transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
      {settings && categories && <Footer settings={settings} categories={categories} />}
    </div>
  );
}

/**
 * Atomic Block Renderer for Gutenberg/Wordpress-style Blocks
 */
function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
          {block.content}
        </p>
      );

    case 'heading-h2':
      return (
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4">
          {block.content}
        </h2>
      );

    case 'heading-h3':
      return (
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3">
          {block.content}
        </h3>
      );

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
              â€” {block.attrs.author}
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
 * Places inline recommendations seamlessly at ~40% without breaking tags or paragraphs.
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

  // HTML content: split on major closing tags (</p>, </h2>, </h3>, </figure>, </blockquote>, </div>)
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

