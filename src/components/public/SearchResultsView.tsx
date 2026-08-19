'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { Category, MenuItem, Post, SiteSettings } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

interface SearchResultsViewProps {
  query: string;
  initialPosts: Post[];
  categories: Category[];
  settings: SiteSettings;
  primaryMenuItems?: MenuItem[];
}

const BATCH_SIZE = 12;
const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

export default function SearchResultsView({
  query,
  initialPosts,
  categories,
  settings,
  primaryMenuItems,
}: SearchResultsViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(query);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialPosts.length >= BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Sync state when props change
  useEffect(() => {
    setSearchTerm(query);
    setPosts(initialPosts);
    setOffset(initialPosts.length);
    setHasMore(initialPosts.length >= BATCH_SIZE);
  }, [query, initialPosts]);

  // Record search analytics query on mount if present
  useEffect(() => {
    if (query && query.trim().length > 1) {
      fetch('/api/search/most-searched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      }).catch((err) => {
        console.error('Error recording search query:', err);
      });
    }
  }, [query]);

  // Fetch next batch for infinite scrolling (works for both search query and latest articles)
  const loadNextBatch = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const endpoint = query
        ? `/api/posts?search=${encodeURIComponent(query)}&status=published&limit=${BATCH_SIZE}&offset=${offset}`
        : `/api/posts?status=published&limit=${BATCH_SIZE}&offset=${offset}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data: Post[] = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
        setOffset((prev) => prev + data.length);
        if (data.length < BATCH_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, hasMore, isLoading, offset]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadNextBatch();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadNextBatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased flex flex-col">
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      {/* Main Container */}
      <main className="breadcrumb-page-main flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium mb-6">
          <Link href="/" className="hover:text-[#db2777] transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-stone-900 font-semibold">Search</span>
        </nav>

        {/* Soft Light Pink Search Banner */}
        <div className="bg-[#fdf2f8] border border-pink-100/80 rounded-xl p-4 sm:p-10 md:p-12 flex items-center justify-center mb-10 shadow-2xs w-full box-border overflow-hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 sm:gap-3 w-full max-w-2xl min-w-0 box-border"
          >
            <input
              type="text"
              name="q"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search article..."
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-white border border-stone-200/80 rounded-lg text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#db2777] shadow-2xs font-sans box-border"
            />
            <button
              type="submit"
              className="px-4 sm:px-7 py-3 bg-stone-950 hover:bg-[#db2777] text-white font-bold text-xs sm:text-sm rounded-lg transition shrink-0 shadow-2xs font-sans whitespace-nowrap cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Heading Section: "Search Results for..." or "Latest Articles" */}
        <div className="mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-1.5 h-8 sm:h-10 bg-[#db2777] shrink-0 rounded-none"></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight font-sans">
              {query ? `Search Results for "${query}"` : 'Latest Articles'}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        {query && posts.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-stone-50 border border-stone-200 p-8 my-6">
            <h3 className="text-xl font-bold text-stone-800 mb-2">No dispatches found</h3>
            <p className="text-stone-500 mb-6">
              We couldn't find any stories matching "{query}". Try searching for another topic.
            </p>
          </div>
        ) : (
          <>
            {/* Editorial Post Grid: 4 columns desktop, 2 columns tablet, 1 column mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {posts.map((post) => {
                const postCat = post.subCategory || post.category;

                return (
                  <article key={post.id} className="group flex flex-col">
                    {/* Rectangular Image - Sharp corners, no border, no shadow */}
                    <Link
                      href={`/${post.slug}`}
                      className="block overflow-hidden bg-stone-100 aspect-[16/10] w-full mb-3"
                    >
                      <img
                        src={post.featuredImage || DEFAULT_FALLBACK_IMAGE}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-none transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                    </Link>

                    {/* Category Tag */}
                    {postCat && (
                      <Link
                        href={`/${postCat.slug}`}
                        className="text-[#db2777] hover:underline decoration-[#db2777] font-semibold text-xs tracking-wide inline-block mb-1 text-left uppercase"
                      >
                        {postCat.name}
                      </Link>
                    )}

                    {/* Post Title */}
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

            {/* Infinite Scroll Trigger & Loader */}
            <div
              ref={observerTarget}
              className="py-12 flex flex-col items-center justify-center w-full min-h-[60px]"
            >
              {isLoading && (
                <div className="flex items-center gap-2 text-stone-600 text-sm font-medium py-4">
                  <Loader2 className="w-4 h-4 text-[#db2777] animate-spin" />
                  <span>Loading more articles...</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && !isLoading && (
                <div className="text-center text-stone-400 text-xs uppercase tracking-widest py-4 border-t border-stone-100 w-full mt-6">
                  End of dispatches
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
