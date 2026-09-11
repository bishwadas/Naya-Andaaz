'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ListFilter,
  CheckCircle2,
  Clock,
  FolderTree,
  Tag,
  Image,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { User as UserType } from '@/types';

interface EditorSidebarProps {
  user: UserType;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingReviewCount?: number;
}

export function EditorSidebar({
  user,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  pendingReviewCount = 0,
}: EditorSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [postsOpen, setPostsOpen] = useState(true);

  const isPostsActive = pathname.startsWith('/editor/posts');

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
        {/* Top: Brand & Navigation */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-stone-800/80">
            <Link href="/editor" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white font-serif font-black shadow-md shrink-0">
                S
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-serif font-black text-lg tracking-wider text-stone-100 block leading-tight">
                    SEREIA
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 font-bold">
                    Editorial Desk
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Dashboard */}
            <Link
              href="/editor"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname === '/editor'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Editorial Dashboard</span>}
            </Link>

            {/* Review Queue Shortcut */}
            <Link
              href="/editor/posts/review"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname === '/editor/posts/review'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4 shrink-0 text-purple-400" />
                {!isCollapsed && <span>Review Queue</span>}
              </div>
              {!isCollapsed && pendingReviewCount > 0 && (
                <span className="bg-purple-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {pendingReviewCount}
                </span>
              )}
            </Link>

            {/* Posts Group */}
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setPostsOpen(!postsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isPostsActive && !postsOpen && pathname !== '/editor/posts/review'
                    ? 'bg-stone-900 text-pink-400'
                    : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0 text-pink-400" />
                  {!isCollapsed && <span>Articles</span>}
                </div>
                {!isCollapsed && (
                  postsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {postsOpen && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  <Link
                    href="/editor/posts/all-posts"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      pathname === '/editor/posts/all-posts' || pathname === '/editor/posts'
                        ? 'bg-stone-800 text-pink-400 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>All Articles</span>
                  </Link>

                  <Link
                    href="/editor/posts/add-post"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      pathname.includes('/add-post') || pathname.includes('/posts/new')
                        ? 'bg-stone-800 text-pink-400 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Article</span>
                  </Link>

                  <Link
                    href="/editor/posts/review"
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      pathname === '/editor/posts/review'
                        ? 'bg-stone-800 text-purple-400 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Review</span>
                    </span>
                    {pendingReviewCount > 0 && (
                      <span className="bg-purple-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                        {pendingReviewCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Categories */}
            <Link
              href="/editor/categories"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith('/editor/categories')
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span>Categories</span>}
            </Link>

            {/* Tags */}
            <Link
              href="/editor/tags"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith('/editor/tags')
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0 text-teal-400" />
              {!isCollapsed && <span>Tags</span>}
            </Link>

            {/* Media */}
            <Link
              href="/editor/media"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith('/editor/media')
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4 shrink-0 text-blue-400" />
              {!isCollapsed && <span>Media Gallery</span>}
            </Link>

            {/* Profile */}
            <Link
              href="/editor/settings/profile"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith('/editor/settings/profile')
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0 text-pink-400" />
              {!isCollapsed && <span>Editor Profile</span>}
            </Link>

            {/* Settings */}
            <Link
              href="/editor/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname === '/editor/settings'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 text-stone-400" />
              {!isCollapsed && <span>Settings</span>}
            </Link>

            {/* Live Website */}
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

        {/* Bottom User Profile Card */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/80">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-500/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name?.charAt(0) || 'E'}
                </div>
              )}
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-stone-200 truncate">{user.name}</p>
                  <span className="text-[10px] uppercase font-mono bg-purple-950 text-purple-400 px-1.5 py-0.2 rounded font-semibold">
                    Editor
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
