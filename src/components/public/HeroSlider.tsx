'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Post } from '@/types';

import 'swiper/css';
import 'swiper/css/pagination';

interface HeroSliderProps {
  posts: Post[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts }) => {
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
        {sliderPosts.map((post) => {
          const categorySlug = post.subCategory?.slug || post.category?.slug || '';
          const categoryName = post.subCategory?.name || post.category?.name || 'Featured';
          const imageUrl =
            post.featuredImage ||
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

          return (
            <SwiperSlide key={post.id} className="w-full">
              {/* IMPORTANT: The outer slide container is a div, NOT clickable */}
              <div className="w-full select-none" id={`hero-slide-${post.id}`}>
                {/* 1. Featured Image Link: Clickable (opens article) */}
                <Link
                  href={`/${post.slug}`}
                  className="block relative aspect-[16/9] w-full overflow-hidden bg-gray-100 group"
                  id={`hero-slide-img-link-${post.id}`}
                >
                  <img
                    src={imageUrl}
                    alt={post.title}
                    width="1200"
                    height="675"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="eager"
                  />
                </Link>

                {/* 2. Meta & Title Area */}
                <div className="mt-2.5 sm:mt-3">
                  {/* Category label is clickable linking to category page */}
                  {categorySlug ? (
                    <Link
                      href={`/${categorySlug}`}
                      className="text-pink-600 font-bold uppercase tracking-wider text-xs block mb-1 hover:underline"
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
                    href={`/${post.slug}`}
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

