'use client';

import React from 'react';
import Link from 'next/link';
import { Tag as TagIcon, Clock, Eye, ArrowLeft } from 'lucide-react';
import { Category, MenuItem, Post, SiteSettings, Tag } from '@/types';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

interface TagArchiveViewProps {
  tag: Tag;
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  primaryMenuItems?: MenuItem[];
}

export function TagArchiveView({ tag, posts, categories, settings, primaryMenuItems }: TagArchiveViewProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      <Navbar categories={categories} settings={settings} primaryMenuItems={primaryMenuItems} />

      <main className="breadcrumb-page-main max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-amber-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-stone-900">Tag: #{tag.name}</span>
        </div>

        {/* Tag Header */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-stone-950">#{tag.name}</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {posts.length} {posts.length === 1 ? 'story' : 'stories'} published under this tag
              </p>
            </div>
          </div>
          {tag.description && (
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">{tag.description}</p>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
            <p className="text-base font-serif">No stories found with tag #{tag.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden bg-stone-100 relative">
                  <img
                    src={
                      post.featuredImage ||
                      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-stone-950 text-lg group-hover:text-amber-600 transition leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-medium text-stone-800">{post.author?.name || 'Sereia Editorial'}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime || 3}m</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
