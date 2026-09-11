import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category, Post } from '@/types';
import { getPostCategoryUrl } from '@/lib/categories';
import { getOptimizedImageUrl } from '@/lib/images';

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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" id={`heading-${categorySlug}`}>
          {title}
        </h2>

        <Link
          href={categorySlug === 'food-wine' ? '/food' : `/${categorySlug}`}
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
          const rawImage = post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
          const optimizedThumb = getOptimizedImageUrl(rawImage, 360);

          return (
            <div
              key={`mob-${post.id}`}
              className="group flex items-center gap-3.5 sm:gap-4"
              id={`mob-card-${post.id}`}
            >
              <Link
                href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                className="w-28 sm:w-36 aspect-[16/9] shrink-0 overflow-hidden bg-gray-100 block"
                id={`mob-img-link-${post.id}`}
              >
                <img
                  src={optimizedThumb}
                  alt={post.title}
                  width={288}
                  height={162}
                  loading="lazy"
                  decoding="async"
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
                  href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
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
              const rawImage = post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
              const optimizedImg = getOptimizedImageUrl(rawImage, 480);

              return (
                <div key={`left-${post.id}`} className="group block" id={`left-card-${post.id}`}>
                  <Link
                    href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                    className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                    id={`left-img-link-${post.id}`}
                  >
                    <img
                      src={optimizedImg}
                      alt={post.title}
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
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
                      href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
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
          const rawImage = centerPost.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
          const optimizedCenter = getOptimizedImageUrl(rawImage, 800);

          return (
            <div className={`${leftPosts.length > 0 && rightPosts.length > 0 ? 'lg:col-span-6' : leftPosts.length > 0 || rightPosts.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col`}>
              <div className="group block h-full flex flex-col justify-between" id={`center-card-${centerPost.id}`}>
                <Link
                  href={`/${centerPost.subCategory?.slug || 'uncategorized'}/${centerPost.slug}`}
                  className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                  id={`center-img-link-${centerPost.id}`}
                >
                  <img
                    src={optimizedCenter}
                    alt={centerPost.title}
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
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
                    href={`/${centerPost.subCategory?.slug || 'uncategorized'}/${centerPost.slug}`}
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
              const rawImage = post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
              const optimizedImg = getOptimizedImageUrl(rawImage, 480);

              return (
                <div key={`right-${post.id}`} className="group block" id={`right-card-${post.id}`}>
                  <Link
                    href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                    className="block aspect-[16/9] w-full overflow-hidden bg-gray-100"
                    id={`right-img-link-${post.id}`}
                  >
                    <img
                      src={optimizedImg}
                      alt={post.title}
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
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
                      href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
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

