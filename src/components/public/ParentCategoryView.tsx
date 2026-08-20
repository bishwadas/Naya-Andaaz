'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Category, MenuItem, Post, SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { filterPostsForCategoryTree } from '@/lib/categories';
import { getPostCategoryUrl, getCategoryUrl } from '@/lib/categories';
import FeaturedHero from '@/components/public/FeaturedHero';

interface ParentCategoryViewProps {
  currentCategory: Category;
  childCategories: Category[];
  categoryPosts: Post[];
  categories: Category[];
  settings: SiteSettings;
  primaryMenuItems?: MenuItem[];
}

export default function ParentCategoryView({
  currentCategory,
  childCategories,
  categoryPosts,
  categories,
  settings,
  primaryMenuItems,
}: ParentCategoryViewProps) {
  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased flex flex-col">
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      <main className="breadcrumb-page-main flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-600 mb-6 font-medium">
          <Link href="/" className="hover:text-pink-600 transition">
            Home
          </Link>
          <span className="text-stone-400">&gt;</span>
          <span className="text-stone-900 font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Parent Category Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-10 bg-pink-600 rounded-sm"></div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 tracking-tight">
            {currentCategory.name}
          </h1>
        </div>

        {/* Shared front-page hero, filtered to this category tree. */}
        <FeaturedHero posts={categoryPosts} categories={categories} />

        {/* Child Category Sections */}
        {childCategories.map((child) => {
          const childPosts = filterPostsForCategoryTree(child, categories, categoryPosts);

          if (childPosts.length === 0) return null;

          // Desktop 3-column layout distribution:
          // Left: 2 posts (index 1, 2)
          // Center: 1 large post (index 0)
          // Right: 2 posts (index 3, 4)
          const centerPost = childPosts[0];
          const leftPosts = [childPosts[1], childPosts[2]].filter(Boolean);
          const rightPosts = [childPosts[3], childPosts[4]].filter(Boolean);

          return (
            <section key={child.id} className="mb-20 pt-8 border-t border-stone-200">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
                    {child.name}
                  </h2>
                  {/* Pink wavy / zig-zag underline */}
                  <div className="w-24 h-1 mt-1 bg-pink-600 rounded-full"></div>
                </div>
                <Link
                  href={getCategoryUrl(child, categories)}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-pink-600 group transition"
                >
                  <span>See More</span>
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Desktop 3-Column Editorial Layout */}
              <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
                {/* Left Side: 2 Supporting Posts */}
                <div className="col-span-3 flex flex-col gap-6">
                  {leftPosts.map((post) => {
                    const cat = post.subCategory || post.category;
                    return (
                      <div key={post.id} className="flex flex-col group">
                        <Link href={`/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden rounded-none bg-stone-100 mb-3">
                          <img
                            src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                            alt={post.title}
                            width={1200}
                            height={675}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </Link>
                        {cat && (
                          <Link
                            href={getPostCategoryUrl(post, categories)}
                            className="text-[11px] font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 mb-1 transition"
                          >
                            {cat.name}
                          </Link>
                        )}
                        <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-pink-600 transition">
                          <Link href={`/${post.slug}`}>{post.title}</Link>
                        </h3>
                      </div>
                    );
                  })}
                </div>

                {/* Center: Large Featured Post */}
                {centerPost && (
                  <div className="col-span-6 flex flex-col group">
                    <Link href={`/${postSlug(centerPost)}`} className="block relative aspect-[16/9] overflow-hidden rounded-none bg-stone-100 mb-4 shadow-none border-none">
                      <img
                        src={centerPost.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                        alt={centerPost.title}
                        width={1200}
                        height={675}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 border-none shadow-none"
                      />
                    </Link>
                    {centerPostSubCat(centerPost) && (
                      <Link
                        href={getPostCategoryUrl(centerPost, categories)}
                        className="text-xs font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 mb-1.5 transition"
                      >
                        {centerPostSubCat(centerPost)?.name}
                      </Link>
                    )}
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-stone-900 leading-snug group-hover:text-pink-600 transition">
                      <Link href={`/${centerPost.slug}`}>{centerPost.title}</Link>
                    </h3>
                  </div>
                )}

                {/* Right Side: 2 Supporting Posts */}
                <div className="col-span-3 flex flex-col gap-6">
                  {rightPosts.map((post) => {
                    const cat = post.subCategory || post.category;
                    return (
                      <div key={post.id} className="flex flex-col group">
                        <Link href={`/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden rounded-none bg-stone-100 mb-3 shadow-none border-none">
                          <img
                            src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                            alt={post.title}
                            width={1200}
                            height={675}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 border-none shadow-none"
                          />
                        </Link>
                        {cat && (
                          <Link
                            href={getPostCategoryUrl(post, categories)}
                            className="text-[11px] font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 mb-1 transition"
                          >
                            {cat.name}
                          </Link>
                        )}
                        <h3 className="text-base font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-pink-600 transition">
                          <Link href={`/${post.slug}`}>{post.title}</Link>
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile & Tablet Vertical / Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                {childPosts.slice(0, 4).map((post) => {
                  const cat = post.subCategory || post.category;
                  return (
                    <div key={post.id} className="flex gap-4 items-center bg-white p-2 group">
                      <Link href={`/${post.slug}`} className="block relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-none bg-stone-100 shadow-none border-none">
                        <img
                          src={post.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                          alt={post.title}
                          width={1200}
                          height={675}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 border-none shadow-none"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        {cat && (
                          <Link
                            href={getPostCategoryUrl(post, categories)}
                            className="inline-block text-[11px] font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 mb-1 transition"
                          >
                            {cat.name}
                          </Link>
                        )}
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-pink-600 transition">
                          <Link href={`/${post.slug}`}>{post.title}</Link>
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}

function postSlug(post: Post) {
  return post.slug;
}

function centerPostSubCat(post: Post) {
  return post.subCategory || post.category;
}
