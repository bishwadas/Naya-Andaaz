'use client';

import React, { useState } from 'react';
import { Share2, Heart, Bookmark, Check, Copy } from 'lucide-react';

interface ArticleActionsProps {
  postTitle: string;
  postUrl: string;
  initialLikes?: number;
  postId: string;
}

export function ArticleActions({ postTitle, postUrl, initialLikes = 0, postId }: ArticleActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLike = async () => {
    if (isLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      try {
        await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      } catch {
        // Optimistic UI
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.href : postUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          url: fullUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.href : postUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${postTitle} - ${postUrl}`)}`,
  };

  return (
    <div className="relative flex items-center flex-wrap gap-2">
      {/* Share Button */}
      <button
        type="button"
        id="article-share-btn"
        onClick={handleShare}
        title="Share article"
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Heart / Like Button */}
      <button
        type="button"
        id="article-like-btn"
        onClick={handleLike}
        title={isLiked ? 'Liked' : 'Like'}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm border flex items-center justify-center transition hover:scale-105 active:scale-95 ${
          isLiked
            ? 'bg-rose-500 border-rose-400 text-white'
            : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {/* Bookmark Button */}
      <button
        type="button"
        id="article-bookmark-btn"
        onClick={handleBookmark}
        title={isBookmarked ? 'Saved' : 'Save'}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm border flex items-center justify-center transition hover:scale-105 active:scale-95 ${
          isBookmarked
            ? 'bg-amber-500 border-amber-400 text-white'
            : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>

      {/* Facebook Link */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Facebook"
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
      >
        <span className="font-bold text-xs sm:text-sm font-sans">f</span>
      </a>

      {/* X / Twitter Link */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
      >
        <span className="font-bold text-xs sm:text-sm font-sans">𝕏</span>
      </a>

      {/* Google News Source Badge */}
      <a
        href="https://news.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 shadow-sm border border-white/40 text-[11px] font-semibold transition hover:scale-105"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>
          Source on <strong className="font-bold">Google</strong>
        </span>
      </a>

      {/* Share fallback popup */}
      {showShareMenu && (
        <div className="absolute right-0 top-12 z-30 bg-white rounded-xl shadow-xl border border-stone-200 p-3 min-w-[200px] text-stone-800 animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Share this story</div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-stone-100 transition text-stone-800"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              {copied ? 'Link Copied!' : 'Copy Link'}
            </span>
            {copied && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-stone-100 transition text-emerald-700"
          >
            Share on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
