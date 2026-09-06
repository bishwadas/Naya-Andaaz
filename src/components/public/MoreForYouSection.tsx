import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { getOptimizedImageUrl } from '@/lib/images';

interface MoreForYouProps {
  posts: Post[];
  title?: string;
  className?: string;
  isSidebar?: boolean;
}

export function MoreForYouSection({
  posts,
  title = 'MORE FOR YOU',
  className = '',
  isSidebar = false,
}: MoreForYouProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <aside
      id={isSidebar ? 'more-for-you-sidebar' : 'more-for-you-inline'}
      aria-label="Recommended Articles"
      className={
        isSidebar
          ? `bg-[#fdf0f7] border border-pink-200/90 rounded-none p-4 sm:p-5 shadow-xs ${className}`
          : `-mx-4 sm:mx-0 w-auto sm:w-full border-y sm:border border-pink-200 bg-[#fdf0f7] px-4 py-4 sm:p-5 rounded-none shadow-none my-8 ${className}`
      }
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-pink-400/80 mb-3.5">
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#db2777]">
          {title}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#db2777] bg-pink-100 px-2 py-0.5 rounded-none">
          Curated
        </span>
      </div>

      <div className="space-y-3 divide-y divide-pink-200/60">
        {posts.map((item, index) => {
          const href = `/${item.subCategory?.slug || item.category?.slug || 'uncategorized'}/${item.slug}`;
          const fallbackImage =
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80';
          const rawImageUrl = item.featuredImage || fallbackImage;
          const optimizedThumb = getOptimizedImageUrl(rawImageUrl, 240);

          return (
            <div key={item.id || index} className={index > 0 ? 'pt-3' : ''}>
              <Link
                href={href}
                className="group flex items-start gap-3 transition-colors duration-200"
              >
                {/* Thumbnail Image (Sharp rectangular, no rounded corners) */}
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 rounded-none overflow-hidden bg-stone-200 border border-pink-200 shadow-none">
                  <img
                    src={optimizedThumb}
                    alt={item.title}
                    width={120}
                    height={80}
                    className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  {item.category && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#db2777] mb-0.5">
                      {item.category.name}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug font-serif">
                    {item.title}
                  </h4>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

