'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ListFilter,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Send,
  FileEdit,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { User as UserType } from '@/types';

interface AuthorSidebarProps {
  user: UserType;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AuthorSidebar({
  user,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: AuthorSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [postsOpen, setPostsOpen] = useState(true);

  const isPostsActive = pathname.startsWith('/author/posts');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-stone-950 text-stone-200 border-r border-stone-800 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand & Workspace */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-stone-800/80">
            <Link href="/author" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white font-serif font-black shadow-md shrink-0">
                N
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-serif font-black text-lg tracking-wider text-stone-100 block leading-tight">
                    NAYA ANDAAZ
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">
                    Author Studio
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Dashboard */}
            <Link
              href="/author"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname === '/author'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard Overview</span>}
            </Link>

            {/* Posts Group */}
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setPostsOpen(!postsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isPostsActive && !postsOpen
                    ? 'bg-stone-900 text-pink-400'
                    : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0 text-pink-400" />
                  {!isCollapsed && <span>My Articles</span>}
                </div>
                {!isCollapsed && (
                  postsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {postsOpen && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <Link
                    href="/author/posts/all-posts"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      pathname === '/author/posts/all-posts' || pathname === '/author/posts'
                        ? 'bg-stone-800 text-pink-400 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>All My Posts</span>
                  </Link>

                  <Link
                    href="/author/posts/all-posts/add-post"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      pathname.includes('/add-post') || pathname.includes('/posts/new')
                        ? 'bg-stone-800 text-pink-400 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Post</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
              href="/author/settings/profile"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith('/author/settings/profile')
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0 text-pink-400" />
              {!isCollapsed && <span>Author Profile</span>}
            </Link>

            {/* Settings */}
            <Link
              href="/author/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname === '/author/settings'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 text-stone-400" />
              {!isCollapsed && <span>Settings</span>}
            </Link>

            {/* Live Website Preview */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-400 hover:text-white hover:bg-stone-900 transition mt-4"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>View Public Site</span>}
            </Link>
          </nav>
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/80">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-pink-500/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-pink-900 text-pink-200 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name?.charAt(0) || 'A'}
                </div>
              )}
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-stone-200 truncate">{user.name}</p>
                  <span className="text-[10px] uppercase font-mono bg-pink-950 text-pink-400 px-1.5 py-0.2 rounded font-semibold">
                    Author
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => logout('/login')}
              disabled={isLoggingOut}
              title="Sign Out"
              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
