'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Animated404Illustration } from '@/components/public/Animated404Illustration';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };

  return (
    <main
      role="main"
      className="min-h-screen bg-white text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 overflow-x-hidden selection:bg-pink-100 selection:text-pink-900"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 py-6 md:py-12">
        {/* LEFT COLUMN: Animated SVG Skydiving Illustration */}
        <div className="w-full lg:w-1/2 flex items-center justify-center max-w-[480px] lg:max-w-none">
          <Animated404Illustration className="w-full" />
        </div>

        {/* RIGHT COLUMN: 404 Copy & Action Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5 max-w-lg">
          {/* 404 Heading with Accent Rays */}
          <div className="relative inline-flex items-center">
            <span className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-pink-600 leading-none select-none">
              404
            </span>
            {/* Sparkle Rays */}
            <svg
              className="absolute -top-2 -right-8 sm:-top-3 sm:-right-9 w-8 h-8 sm:w-9 sm:h-9 text-pink-600"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="20" y1="5" x2="15" y2="10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="4" y1="5" x2="9" y2="10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-snug">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-stone-500 text-sm sm:text-base md:text-lg leading-relaxed max-w-md">
            We couldn’t find the page you are looking for.
            <br className="hidden sm:inline" /> It might have been removed or is temporarily unavailable.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-3 sm:pt-4 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-semibold text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Back To Home
            </Link>
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 font-semibold text-sm sm:text-base rounded-full border border-stone-300 shadow-sm hover:border-stone-400 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
