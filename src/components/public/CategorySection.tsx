import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category, Post } from '@/types';
import { getPostCategoryUrl } from '@/lib/categories';

interface CategorySectionProps {
  title: string;
  categorySlug: string;
  posts: Post[];
  categories?: Category[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  categorySlug,
  posts,
  categories = [],
}) => {
  if (!posts || posts.length === 0) return null;

  // Split posts for desktop 3-column layout without duplicating posts
  const centerPost = posts[0]; // primary prominent story
  const leftPosts = posts.slice(1, 3); // up to 2 stories on left
  const rightPosts = posts.slice(3, 5); // up to 2 stories on right

  return (
    <section className="py-6 sm:py-8 border-b border-gray-200 last:border-b-0" id={`section-${categorySlug}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" id={`heading-${categorySlug}`}>
            {title}
          </h2>
          {/* Pink Squiggle Accent */}
          <svg className="section-heading-accent w-9 sm:w-11 h-2 text-pink-600 mt-1" viewBox="0 0 42 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 4C3 1.5 5 1.5 7 4C9 6.5 11 6.5 13 4C15 1.5 17 1.5 19 4C21 6.5 23 6.5 25 4C27 1.5 29 1.5 31 4C33 6.5 35 6.5 37 4C39 1.5 41 1.5 41 4" stroke="#db2777" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <Link
          href={`/${categorySlug}`}
          className="group flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900 hover:text-pink-600 transition-colors category-link"
          id={`see-more-${categorySlug}`}
        >
          <span>SEE MORE</span>
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-pink-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </span>
        </Link>
      </div>

      {/* Mobile Layout: Single-column compact horizontal cards (< lg) */}
      <div className="flex flex-col gap-4 lg:hidden" id={`mob-posts-${categorySlug}`}>
        {posts.map((post) => {
          const catName = post.subCategory?.name || post.category?.name || title;
          const catUrl = (post.subCategory || post.category) ? getPostCategoryUrl(post, categories) : `/${categorySlug}`;
          return (
            <div
              key={`mob-${post.id}`}
              className="group flex items-center gap-3.5 sm:gap-4"
              id={`mob-card-${post.id}`}
            >
              <Link
                href={`/${post.slug}`}
                className="w-28 sm:w-36 aspect-[16/9] shrink-0 overflow-hidden bg-gray-100 block"
                id={`mob-img-link-${post.id}`}
              >
                <img
                  src={
                    post.featuredImage ||
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={post.title}
                  width="1200"
                  height="675"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={catUrl}
                  className="text-pink-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wider block mb-0.5 category-link"
                >
                  {catName}
                </Link>
                <Link
                  href={`/${post.slug}`}
                  className="hover:text-pink-600 transition-colors block"
                  id={`mob-title-link-${post.id}`}
                >
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 sm:line-clamp-3">
                    {post.title}
                  </h3>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Layout: 3-Column Grid (lg and above) */}
      <div className="hidden lg:grid grid-cols-12 gap-6 items-stretch" id={`desktop-posts-${categorySlug}`}>
        {/* Left Column (up to 2 stacked cards) - lg:col-span-3 */}
        {leftPosts.length > 0 && (
          <div className={`flex flex-col gap-6 justify-between ${centerPost && rightPosts.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {leftPosts.map((post) => {
              const catName = post.subCategory?.name || post.category?.name || title;
              const catUrl = (post.subCategory || post.category) ? getPostCategoryUrl(post, categories) : `/${categorySlug}`;
              return (
                <div key={`left-${post.id}`} className="group block" id={`left-card-${post.id}`}>
                  <Link
                    href={`/${post.slug}`}
                    className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                    id={`left-img-link-${post.id}`}
                  >
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                      alt={post.title}
                      width="1200"
                      height="675"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="mt-2.5">
                    <Link
                      href={catUrl}
                      className="text-pink-600 text-xs font-bold uppercase tracking-wider block mb-0.5 category-link"
                    >
                      {catName}
                    </Link>
                    <Link
                      href={`/${post.slug}`}
                      className="hover:text-pink-600 transition-colors block"
                      id={`left-title-link-${post.id}`}
                    >
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Center Column (1 large featured card) - lg:col-span-6 */}
        {centerPost && (() => {
          const catName = centerPost.subCategory?.name || centerPost.category?.name || title;
          const catUrl = (centerPost.subCategory || centerPost.category) ? getPostCategoryUrl(centerPost, categories) : `/${categorySlug}`;
          return (
            <div className={`${leftPosts.length > 0 && rightPosts.length > 0 ? 'lg:col-span-6' : leftPosts.length > 0 || rightPosts.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col`}>
              <div className="group block h-full flex flex-col justify-between" id={`center-card-${centerPost.id}`}>
                <Link
                  href={`/${centerPost.slug}`}
                  className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                  id={`center-img-link-${centerPost.id}`}
                >
                  <img
                    src={centerPost.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                    alt={centerPost.title}
                    width="1200"
                    height="675"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="mt-3 flex-1 flex flex-col justify-start">
                  <Link
                    href={catUrl}
                    className="text-pink-600 text-xs sm:text-sm font-bold uppercase tracking-wider block mb-1 category-link"
                  >
                    {catName}
                  </Link>
                  <Link
                    href={`/${centerPost.slug}`}
                    className="hover:text-pink-600 transition-colors block"
                    id={`center-title-link-${centerPost.id}`}
                  >
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug line-clamp-3">
                      {centerPost.title}
                    </h3>
                  </Link>
                  {centerPost.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-2 font-sans leading-relaxed">
                      {centerPost.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Right Column (up to 2 stacked cards) - lg:col-span-3 */}
        {rightPosts.length > 0 && (
          <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
            {rightPosts.map((post) => {
              const catName = post.subCategory?.name || post.category?.name || title;
              const catUrl = (post.subCategory || post.category) ? getPostCategoryUrl(post, categories) : `/${categorySlug}`;
              return (
                <div key={`right-${post.id}`} className="group block" id={`right-card-${post.id}`}>
                  <Link
                    href={`/${post.slug}`}
                    className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                    id={`right-img-link-${post.id}`}
                  >
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                      alt={post.title}
                      width="1200"
                      height="675"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="mt-2.5">
                    <Link
                      href={catUrl}
                      className="text-pink-600 text-xs font-bold uppercase tracking-wider block mb-0.5 category-link"
                    >
                      {catName}
                    </Link>
                    <Link
                      href={`/${post.slug}`}
                      className="hover:text-pink-600 transition-colors block"
                      id={`right-title-link-${post.id}`}
                    >
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

