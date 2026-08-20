'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { Category, MenuItem, Post, SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getPostCategoryUrl } from '@/lib/categories';

interface SubCategoryArchiveViewProps {
  currentCategory: Category;
  parentCategory?: Category;
  categoryPosts: Post[];
  categories: Category[];
  settings: SiteSettings;
  primaryMenuItems?: MenuItem[];
  initialMostSearchedTerms?: string[];
}

const DEFAULT_MOST_SEARCHED = [
  'Friday OTT Releases',
  'XO Kitty Season 3 Twitter Review',
  'Crime 101',
  'Sitaare Zameen Par OTT Release',
  'OTT Releases This Week',
  'Punjabi Movie Download Website',
  'Hollywood Series Download',
  'Websites To Watch Bollywood Movies',
  'Websites To Download South Indian Movies',
  'Websites To Download Tamil Dubbed Movies',
];

export default function SubCategoryArchiveView({
  currentCategory,
  parentCategory,
  categoryPosts,
  categories,
  settings,
  primaryMenuItems,
  initialMostSearchedTerms,
}: SubCategoryArchiveViewProps) {
  // Infinite scroll batch state (initial batch of 9 for 3-column desktop grid)
  const [displayCount, setDisplayCount] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Dynamic Most Searched terms from database
  const [mostSearchedTerms, setMostSearchedTerms] = useState<string[]>(
    initialMostSearchedTerms && initialMostSearchedTerms.length > 0
      ? initialMostSearchedTerms
      : DEFAULT_MOST_SEARCHED
  );

  // Fetch updated search terms on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/search/most-searched')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && Array.isArray(data.terms) && data.terms.length > 0) {
          setMostSearchedTerms(data.terms);
        }
      })
      .catch((err) => {
        console.error('Error fetching most searched terms:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Infinite Scroll IntersectionObserver logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < categoryPosts.length && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + 6, categoryPosts.length));
            setIsLoading(false);
          }, 350);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [displayCount, categoryPosts.length, isLoading]);

  const displayedPosts = categoryPosts.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased flex flex-col">
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      {/* Main Container - Generous spacing below Navbar */}
      <main className="breadcrumb-page-main flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium mb-6">
          <Link href="/" className="hover:text-[#db2777] transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {parentCategory && (
            <>
              <Link href={`/${parentCategory.slug}`} className="hover:text-[#db2777] transition">
                {parentCategory.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </>
          )}
          <span className="text-stone-900 font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Sub-Category Header with Accent Bar */}
        <div className="mb-8 pb-4">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-1.5 h-8 sm:h-10 md:h-11 bg-[#db2777] shrink-0 rounded-none"></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-950 tracking-tight">
              {currentCategory.name}
            </h1>
          </div>
          {currentCategory.description && (
            <p className="text-stone-600 text-sm sm:text-base mt-2 font-serif max-w-3xl leading-relaxed pl-5">
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* Main Content Layout: Posts Grid (Left) + Most Searched Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            {categoryPosts.length === 0 ? (
              <div className="text-center py-20 bg-stone-50 rounded-none border border-stone-200 p-8">
                <h3 className="text-xl font-bold text-stone-800 mb-2">No stories found</h3>
                <p className="text-stone-500 mb-6">
                  There are currently no published articles in {currentCategory.name}.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-5 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#db2777] transition"
                >
                  Explore Homepage
                </Link>
              </div>
            ) : (
              <>
                {/* Editorial Post Grid: 3-column grid on desktop, sharp rectangular images, clean typography */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {displayedPosts.map((post) => {
                    const postCat = post.subCategory || post.category || currentCategory;

                    return (
                      <article key={post.id} className="group flex flex-col">
                        {/* Sharp Rectangular Image - No rounded corners, no card border, no shadow */}
                        <Link
                          href={`/${post.slug}`}
                          className="block overflow-hidden bg-stone-100 aspect-[16/10] w-full mb-3"
                        >
                          <img
                            src={
                              post.featuredImage ||
                              'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
                            }
                            alt={post.title}
                            className="w-full h-full object-cover rounded-none transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </Link>

                        {/* Category Label - Pink Accent Text */}
                        {postCat && (
                          <Link
                            href={getPostCategoryUrl(post, categories)}
                            className="text-[#db2777] hover:underline decoration-[#db2777] font-medium text-xs sm:text-[13px] tracking-wide inline-block mb-1 text-left uppercase"
                          >
                            {postCat.name}
                          </Link>
                        )}

                        {/* Post Title - Strong Headline with Hover Underline */}
                        <h2 className="font-bold text-base sm:text-[17px] text-stone-950 leading-snug tracking-tight text-left">
                          <Link
                            href={`/${post.slug}`}
                            className="hover:underline decoration-stone-900 underline-offset-2 transition-colors duration-150"
                          >
                            {post.title}
                          </Link>
                        </h2>
                      </article>
                    );
                  })}
                </div>

                {/* Infinite Scroll Indicator & Trigger */}
                <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center w-full min-h-[60px]">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
                      <Loader2 className="w-4 h-4 text-[#db2777] animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                  {displayCount >= categoryPosts.length && categoryPosts.length > 0 && !isLoading && (
                    <div className="text-center text-stone-400 text-xs uppercase tracking-widest py-4 border-t border-stone-100 w-full mt-6">
                      End of dispatches
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar: MOST SEARCHED Section */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-32 bg-white pt-2 sm:pt-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-700 pb-2.5 border-b border-stone-200 mb-4">
                MOST SEARCHED
              </h3>
              <div className="flex flex-wrap gap-2">
                {mostSearchedTerms.slice(0, 10).map((term, idx) => (
                  <Link
                    key={`most-searched-${idx}`}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="inline-block bg-stone-100/90 hover:bg-pink-50 text-stone-700 hover:text-[#db2777] text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 border border-stone-200/60 shadow-2xs"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
