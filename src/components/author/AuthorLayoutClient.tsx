'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Plus, ExternalLink, Sparkles, User, FileText } from 'lucide-react';
import { AuthorSidebar } from './AuthorSidebar';
import { User as UserType } from '@/types';

interface AuthorLayoutClientProps {
  user: UserType;
  children: React.ReactNode;
}

export function AuthorLayoutClient({ user, children }: AuthorLayoutClientProps) {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Full-screen dedicated editor check
  const isDedicatedEditor =
    pathname.includes('/posts/add-post') ||
    pathname.includes('/posts/new') ||
    (pathname.includes('/posts/') && pathname.endsWith('/edit'));

  if (isDedicatedEditor) {
    return <div className="min-h-screen bg-stone-50 font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans selection:bg-[#FCE7F3] selection:text-[#111111]">
      <AuthorSidebar
        user={user}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-stone-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-bold text-stone-900">
                Author Workspace
              </h1>
              <p className="text-[11px] text-stone-500">Draft, write, and submit articles for review</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/author/posts/all-posts/add-post"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-full shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Story</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
