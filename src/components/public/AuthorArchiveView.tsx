'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  Loader2,
  User as UserIcon,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Category, MenuItem, Post, SiteSettings, User } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getPostCategoryUrl } from '@/lib/categories';
import { getAuthorUrl } from '@/lib/urls';
import { generateAuthorJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { getOptimizedImageUrl } from '@/lib/images';

interface AuthorArchiveViewProps {
  author: User;
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  primaryMenuItems?: MenuItem[];
  initialMostSearchedTerms?: string[];
  allAuthors?: User[];
}

export function AuthorArchiveView({
  author,
  posts,
  categories,
  settings,
  primaryMenuItems,
  allAuthors = [],
}: AuthorArchiveViewProps) {
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [authorsDisplayCount, setAuthorsDisplayCount] = useState(10);

  // Infinite Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && displayCount < posts.length) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + 10, posts.length));
            setIsLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, displayCount, posts.length]);

  const displayedPosts = posts.slice(0, displayCount);
  const displayedAuthors = allAuthors.slice(0, authorsDisplayCount);
  const remainingAuthors = Math.max(0, allAuthors.length - authorsDisplayCount);

  // Format author role label
  const roleLabel =
    author.role?.toUpperCase() === 'ADMIN'
      ? 'Editor-in-Chief'
      : author.role?.toUpperCase() === 'EDITOR'
      ? 'Senior Editor'
      : author.role?.toUpperCase() === 'AUTHOR'
      ? 'Sub Editor'
      : 'Contributing Writer';
      
  const dynAuthor = author as any;

  const authorSchema = generateAuthorJsonLd(author, settings);
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Authors', url: '/authors' },
    { name: author.name || 'Author', url: `/author/${author.username || author.id}` },
  ];
  const breadcrumbSchema = generateBreadcrumbJsonLd(breadcrumbItems, settings);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Navbar
        categories={categories}
        settings={settings}
        primaryMenuItems={primaryMenuItems}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Breadcrumb */}
        <nav
          id="author-breadcrumb"
          className="flex items-center gap-1.5 text-sm text-stone-500 mt-4 md:mt-6 mb-6 lg:mb-8"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-pink-600 flex items-center gap-1 transition">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-stone-500">Author</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-stone-900">{author.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Author Profile */}
          <aside className="col-span-1 lg:col-span-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="shrink-0">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name || 'Author'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-3xl font-bold">
                      {author.name ? author.name.charAt(0) : 'A'}
                    </div>
                  )}
                </div>
                
                {/* Name & Role */}
                <div>
                  <h1 className="text-xl font-bold text-stone-900">
                    {author.name}
                  </h1>
                  <p className="text-sm text-stone-500 mt-1">
                    {dynAuthor.designation || roleLabel}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {(author.facebook || author.twitter || author.linkedin || author.instagram) && (
                <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-6">
                  {author.facebook && (
                    <a
                      href={author.facebook.startsWith('http') ? author.facebook : `https://facebook.com/${author.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-stone-300 rounded text-stone-500 hover:text-pink-600 hover:border-pink-600 transition"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {author.twitter && (
                    <a
                      href={`https://twitter.com/${author.twitter.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-stone-300 rounded text-stone-500 hover:text-pink-600 hover:border-pink-600 transition"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {author.linkedin && (
                    <a
                      href={author.linkedin.startsWith('http') ? author.linkedin : `https://linkedin.com/in/${author.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-stone-300 rounded text-stone-500 hover:text-pink-600 hover:border-pink-600 transition"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {author.instagram && (
                    <a
                      href={`https://instagram.com/${author.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-stone-300 rounded text-stone-500 hover:text-pink-600 hover:border-pink-600 transition"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Bio */}
              {author.bio && (
                <div className="text-sm text-stone-700 mb-6 leading-relaxed">
                  {author.bio}
                </div>
              )}

              {/* Meta information */}
              {(dynAuthor.expertise || dynAuthor.languages || dynAuthor.location) && (
                <div className="space-y-4">
                  {/* Expertise */}
                  {dynAuthor.expertise && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-1">Expertise</h3>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {dynAuthor.expertise}
                      </p>
                    </div>
                  )}

                  {/* Language */}
                  {dynAuthor.languages && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-1">Language</h3>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {dynAuthor.languages}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {dynAuthor.location && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 mb-1">Location</h3>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {dynAuthor.location}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </aside>

          {/* Center Column: Articles */}
          <div className={`col-span-1 ${settings.showOurAuthorsOnAuthorPage !== false ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
            <h2 className="text-2xl lg:text-3xl font-bold text-stone-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-pink-600 block"></span>
              Article By {author.name}
            </h2>

            {posts.length === 0 ? (
              <div className="text-center py-12 text-stone-500 border border-stone-200 rounded-lg">
                No published articles yet.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {displayedPosts.map((post) => {
                    const categoryUrl = getPostCategoryUrl(post, categories);
                    const categoryName = post.subCategory?.name || post.category?.name || 'News';

                    return (
                      <article key={post.id} className="flex flex-col group">
                        {/* Featured Image */}
                        <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`} className="block mb-4 overflow-hidden relative aspect-[3/2] bg-stone-100">
                          {post.featuredImage ? (
                            <img
                              src={getOptimizedImageUrl(post.featuredImage, 540)}
                              alt={post.title}
                              width={540}
                              height={360}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                              No Image
                            </div>
                          )}
                        </Link>
                        
                        {/* Content */}
                        <div>
                          <Link href={categoryUrl} className="text-pink-600 text-[11px] font-semibold mb-2 block hover:underline uppercase tracking-wide">
                            {categoryName}
                          </Link>
                          <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:underline transition">
                            <Link href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}>{post.title}</Link>
                          </h3>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Infinite Scroll Trigger Indicator */}
                {displayCount < posts.length && (
                  <div ref={observerTarget} className="py-6 flex justify-center items-center">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Our Authors */}
          {settings.showOurAuthorsOnAuthorPage !== false && (
            <aside className="col-span-1 lg:col-span-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2 inline-block relative">
                Our Author
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-stone-900"></span>
              </h3>

            <div className="flex flex-col gap-5">
              {displayedAuthors.map((u) => {
                const authorRoleLabel =
                  u.role?.toUpperCase() === 'ADMIN'
                    ? 'Editor-in-Chief'
                    : u.role?.toUpperCase() === 'EDITOR'
                    ? 'Senior Editor'
                    : u.role?.toUpperCase() === 'AUTHOR'
                    ? 'Sub Editor'
                    : 'Contributing Writer';
                    
                const finalDesig = (u as any).designation || authorRoleLabel;

                return (
                  <Link href={getAuthorUrl(u)} key={u.id} className="flex items-center gap-3 group">
                    <div className="shrink-0">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name || 'Author'}
                          className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-pink-500 ring-offset-1 transition"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-lg font-bold group-hover:ring-2 ring-pink-500 ring-offset-1 transition">
                          {u.name ? u.name.charAt(0) : 'A'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 group-hover:text-pink-600 transition">
                        {u.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {finalDesig}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {remainingAuthors > 0 && (
              <div className="mt-8 text-center lg:text-left">
                <button
                  onClick={() => setAuthorsDisplayCount(prev => prev + 10)}
                  className="px-6 py-2.5 bg-white border border-pink-200 text-pink-600 text-xs font-semibold hover:bg-pink-50 transition rounded w-full lg:w-auto"
                >
                  Load More ({remainingAuthors} more)
                </button>
              </div>
            )}
          </aside>
          )}

        </div>
      </main>

      <Footer settings={settings} categories={categories} />
    </div>
  );
}
