import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';

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
      className={`bg-[#fdf2f8] border border-pink-200/80 rounded-2xl p-4 sm:p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b-2 border-pink-500/80 mb-4">
        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-pink-600">
          {title}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 bg-pink-100/80 px-2 py-0.5 rounded">
          Curated
        </span>
      </div>

      <div className="space-y-3.5 divide-y divide-pink-100/90">
        {posts.map((item, index) => {
          const href = `/${item.slug}`;
          const fallbackImage =
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80';
          const imageUrl = item.featuredImage || fallbackImage;

          return (
            <div key={item.id || index} className={index > 0 ? 'pt-3.5' : ''}>
              <Link
                href={href}
                className="group flex items-start gap-3 transition-colors duration-200"
              >
                {/* Thumbnail Image */}
                <div className="relative w-20 h-14 sm:w-22 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-200 border border-pink-200/60 shadow-xs">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  {item.category && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-pink-600 mb-0.5">
                      {item.category.name}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
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
