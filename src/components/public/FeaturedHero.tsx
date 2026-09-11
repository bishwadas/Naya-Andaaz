'use client';

import React from 'react';
import Link from 'next/link';
import { Category, Post } from '@/types';
import { getPostCategoryUrl } from '@/lib/categories';
import { HeroSlider } from '@/components/public/HeroSlider';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';

interface FeaturedHeroProps {
  posts: Post[];
  categories: Category[];
}

/**
 * The shared front-page hero architecture.
 * The caller only controls the post collection; layout and responsive behavior
 * stay identical on the home page and parent category pages.
 */
export default function FeaturedHero({ posts, categories }: FeaturedHeroProps) {
  const sliderPosts = posts.slice(0, 6);
  const supportingPosts = posts.slice(6, 10).length > 0
    ? posts.slice(6, 10)
    : posts.filter((post) => !sliderPosts.some((sliderPost) => sliderPost.id === post.id)).slice(0, 4);

  return (
    <section className="pt-2 sm:pt-4 pb-6 sm:pb-8 border-b border-gray-200" id="hero-section">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-7 items-start">
        <div className="min-w-0">
          <HeroSlider posts={sliderPosts} categories={categories} />

          <div className="flex flex-col gap-4 mt-6 lg:hidden" id="mobile-hero-supporting-posts">
            {supportingPosts.map((post) => {
              const catSlug = post.subCategory?.slug || post.category?.slug || '';
              const catName = post.subCategory?.name || post.category?.name || 'Featured';
              const rawImage = post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
              const optimizedThumb = getOptimizedImageUrl(rawImage, 360);

              return (
                <div key={`mob-hero-${post.id}`} className="group flex items-center gap-3.5 sm:gap-4" id={`mob-hero-item-${post.id}`}>
                  <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="w-28 sm:w-36 aspect-[16/9] shrink-0 overflow-hidden bg-gray-100 block" id={`mob-hero-img-link-${post.id}`}>
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
                    {catSlug ? (
                      <Link href={getPostCategoryUrl(post, categories)} className="text-pink-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-0.5 category-link">{catName}</Link>
                    ) : (
                      <span className="text-pink-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-0.5">{catName}</span>
                    )}
                    <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="hover:text-pink-600 transition-colors block" id={`mob-hero-title-link-${post.id}`}>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 sm:line-clamp-3">{post.title}</h3>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="hidden lg:grid lg:grid-cols-[1.2fr_1.2fr] gap-6 lg:gap-7 items-start"
          id="desktop-hero-supporting-posts"
        >
          {supportingPosts.map((post) => {
            const catSlug = post.subCategory?.slug || post.category?.slug || '';
            const catName = post.subCategory?.name || post.category?.name || 'Featured';
            const rawImage = post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
            const optimizedCard = getOptimizedImageUrl(rawImage, 480);

            return (
              <div key={`desktop-hero-${post.id}`} className="group flex flex-col" id={`desktop-hero-item-${post.id}`}>
                <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="block aspect-[16/9] w-full overflow-hidden bg-gray-100" id={`desktop-hero-img-link-${post.id}`}>
                  <img
                    src={optimizedCard}
                    alt={post.title}
                    width={480}
                    height={270}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="mt-2 flex-1 flex flex-col">
                  {catSlug ? (
                    <Link href={getPostCategoryUrl(post, categories)} className="text-pink-600 text-xs font-bold uppercase tracking-wider block mb-0.5 category-link">{catName}</Link>
                  ) : (
                    <span className="text-pink-600 text-xs font-bold uppercase tracking-wider block mb-0.5">{catName}</span>
                  )}
                  <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="hover:text-pink-600 transition-colors block" id={`desktop-hero-title-link-${post.id}`}>
                    <h4 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">{post.title}</h4>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}