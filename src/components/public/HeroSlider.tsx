'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Category, Post } from '@/types';
import { getPostCategoryUrl } from '@/lib/categories';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';

import 'swiper/css';
import 'swiper/css/pagination';

interface HeroSliderProps {
  posts: Post[];
  categories: Category[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts, categories }) => {
  if (!posts || posts.length === 0) return null;

  // Exactly 6 unique posts for the slider
  const sliderPosts = posts.slice(0, 6);

  return (
    <div className="w-full relative hero-swiper-wrapper" id="hero-slider-container">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        loop={sliderPosts.length > 1}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: '.custom-hero-pagination',
          bulletClass: 'hero-bullet',
          bulletActiveClass: 'hero-bullet-active',
          renderBullet: function (index, className) {
            return `<span class="${className}" aria-label="Go to slide ${index + 1}"></span>`;
          },
        }}
        grabCursor={true}
        simulateTouch={true}
        touchRatio={1}
        preventClicks={true}
        preventClicksPropagation={true}
        className="w-full rounded-none"
      >
        {sliderPosts.map((post, index) => {
          const categorySlug = post.subCategory?.slug || post.category?.slug || '';
          const categoryName = post.subCategory?.name || post.category?.name || 'Featured';
          const rawImageUrl =
            post.featuredImage ||
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
          
          const isLcp = index === 0;
          const optimizedSrc = getOptimizedImageUrl(rawImageUrl, isLcp ? 720 : 640);
          const srcSet = getResponsiveImageSrcSet(rawImageUrl, [360, 480, 640, 800, 1024]);

          return (
            <SwiperSlide key={post.id} className="w-full">
              {/* IMPORTANT: The outer slide container is a div, NOT clickable */}
              <div className="w-full select-none" id={`hero-slide-${post.id}`}>
                {/* 1. Featured Image Link: Clickable (opens article) */}
                <Link
                  href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                  className="block relative aspect-[16/9] w-full overflow-hidden bg-stone-100 group"
                  id={`hero-slide-img-link-${post.id}`}
                >
                  <img
                    src={optimizedSrc}
                    srcSet={srcSet}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 720px"
                    alt={post.title}
                    width={720}
                    height={405}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading={isLcp ? 'eager' : 'lazy'}
                    decoding={isLcp ? 'sync' : 'async'}
                    // @ts-ignore
                    fetchPriority={isLcp ? 'high' : 'auto'}
                  />
                </Link>

                {/* 2. Meta & Title Area */}
                <div className="mt-2.5 sm:mt-3">
                  {/* Category label is clickable linking to category page */}
                  {categorySlug ? (
                    <Link
                      href={getPostCategoryUrl(post, categories)}
                      className="text-pink-600 font-bold uppercase tracking-wider text-xs block mb-1 category-link"
                      id={`hero-slide-cat-${post.id}`}
                    >
                      {categoryName}
                    </Link>
                  ) : (
                    <span
                      className="text-pink-600 font-bold uppercase tracking-wider text-xs block mb-1"
                      id={`hero-slide-cat-${post.id}`}
                    >
                      {categoryName}
                    </span>
                  )}

                  {/* 3. Post Title Link: Clickable (opens article) */}
                  <Link
                    href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                    className="group inline-block"
                    id={`hero-slide-title-link-${post.id}`}
                  >
                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                      {post.title}
                    </h2>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Pagination Dots Container - exactly 6 dots for 6 posts */}
      <div className="custom-hero-pagination flex items-center justify-center gap-2 mt-4 pb-1" id="hero-pagination-dots" />
    </div>
  );
};

