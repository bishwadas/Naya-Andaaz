'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu as MenuIcon,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { AdminSidebar, AdminRouteId, getRouteIdFromPathname } from './AdminSidebar';
import { useAuth } from '@/lib/auth-client';
import { User, SiteSettings } from '@/types';

interface AdminLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

const ROUTE_LABELS: Record<AdminRouteId, { title: string; category?: string }> = {
  dashboard: { title: 'Dashboard Overview', category: 'Analytics' },
  posts_all: { title: 'All Editorial Posts', category: 'Content' },
  posts_add: { title: 'Add New Article', category: 'Editor' },
  categories: { title: 'Category Taxonomy', category: 'Taxonomy' },
  tags: { title: 'Tags Management', category: 'Taxonomy' },
  media: { title: 'Media Library Vault', category: 'Assets' },
  pages_all: { title: 'Static CMS Pages', category: 'Pages' },
  pages_add: { title: 'Create Static Page', category: 'Pages' },
  users_all: { title: 'User Directory & Roles', category: 'Users' },
  users_add: { title: 'Add New User', category: 'Users' },
  comments: { title: 'Comment Moderation Queue', category: 'Community' },
  navigation: { title: 'Navigation & Menu Builder', category: 'Structure' },
  videos: { title: 'Videos & Shorts Hub', category: 'Media' },
  newsletter: { title: 'Newsletter Subscribers', category: 'Audience' },
  advertisements: { title: 'Advertisement Slots', category: 'Monetization' },
  activity_logs: { title: 'System Activity Logs', category: 'Audit' },
  notifications: { title: 'Notification Center', category: 'Alerts' },
  trash: { title: 'Trash Management', category: 'System' },
  profile: { title: 'Editorial Profile', category: 'Account' },
  settings: { title: 'Site & SEO Settings', category: 'System' },
};

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isLoggingOut } = useAuth();
  const effectiveUser = currentUser || user;

  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [badgeCounts, setBadgeCounts] = useState<{
    pendingPosts?: number;
    pendingComments?: number;
    unreadNotifications?: number;
    newsletterSubscribers?: number;
  }>({});

  // Check if current route is a dedicated full-screen editor
  const isDedicatedEditor =
    pathname.includes('/posts/new') ||
    pathname.includes('/posts/add-post') ||
    (pathname.includes('/posts/') && pathname.endsWith('/edit')) ||
    pathname.includes('/pages/new') ||
    (pathname.includes('/pages/') && pathname.endsWith('/edit'));

  useEffect(() => {
    fetchBadgesAndSettings();
  }, [pathname]);

  // Handle Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBadgesAndSettings = async () => {
    try {
      const [pRes, comRes, nRes, sRes] = await Promise.all([
        fetch('/api/posts').then((r) => r.json()).catch(() => []),
        fetch('/api/comments').then((r) => r.json()).catch(() => []),
        fetch('/api/notifications').then((r) => r.json()).catch(() => []),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
      ]);

      const postsList = Array.isArray(pRes) ? pRes : pRes?.posts || [];
      const commentsList = Array.isArray(comRes) ? comRes : comRes?.comments || [];
      const notificationsList = Array.isArray(nRes) ? nRes : [];

      if (sRes && typeof sRes === 'object') {
        setSettings(sRes);
      }

      setBadgeCounts({
        pendingPosts: postsList.filter((p: any) => p.status === 'pending').length,
        pendingComments: commentsList.filter((c: any) => c.status === 'pending').length,
        unreadNotifications: notificationsList.filter((n: any) => !n.isRead && !n.read).length,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    router.push(`/admin/posts/all-posts?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // If full-screen editor, render children directly without double header/sidebar
  if (isDedicatedEditor) {
    return <div className="min-h-screen bg-[#F7F5F2] font-sans">{children}</div>;
  }

  const currentRoute = getRouteIdFromPathname(pathname);
  const routeMeta = ROUTE_LABELS[currentRoute] || { title: 'Admin CMS', category: 'Naya Andaaz' };

  // Website header logo from centralized settings
  const headerLogoUrl = settings?.logoPrimary || settings?.logo || '';

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#171717] flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentRoute={currentRoute}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        badgeCounts={badgeCounts}
        headerLogoUrl={headerLogoUrl}
        siteTitle={settings?.siteTitle || settings?.siteName || 'Naya Andaaz'}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header App Bar */}
        <header
          id="admin-top-header"
          className="h-16 px-4 md:px-6 bg-white border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between gap-3 shadow-xs"
        >
          {/* Left: Mobile Toggle & Header Logo / Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Hamburger Button */}
            <button
              id="admin-mobile-drawer-toggle-btn"
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition shrink-0"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Breadcrumbs for subpages (hidden on dashboard) */}
            {currentRoute !== 'dashboard' && (
              <div className="flex items-center gap-2 text-xs text-stone-500 min-w-0">
                {routeMeta.category && (
                  <>
                    <span className="text-stone-500 hidden sm:inline truncate">{routeMeta.category}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 hidden sm:inline" />
                  </>
                )}
                <h1 className="text-stone-900 font-semibold truncate text-xs sm:text-sm">
                  {routeMeta.title}
                </h1>
              </div>
            )}
          </div>

          {/* Right Header: Search Bar, Notifications, User Profile & View Site */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Search Trigger (Ctrl + K) */}
            <button
              id="admin-header-search-btn"
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg text-xs transition cursor-pointer"
              title="Search CMS (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>Search</span>
              <kbd className="font-mono text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded text-stone-400">
                Ctrl + K
              </kbd>
            </button>

            {/* Notifications Link with Live Badge */}
            <Link
              id="admin-header-notifications-btn"
              href="/admin/notifications"
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {Boolean(badgeCounts?.unreadNotifications && badgeCounts.unreadNotifications > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {badgeCounts.unreadNotifications}
                </span>
              )}
            </Link>

            {/* User Profile Pill & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="admin-header-user-menu-btn"
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 hover:bg-stone-100 rounded-lg border border-stone-200 transition cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <img
                  src={effectiveUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={effectiveUser?.name || 'Admin'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-pink-500/20 shrink-0"
                />
                <div className="hidden sm:block text-left min-w-0">
                  <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[110px]">
                    {effectiveUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-pink-600 font-medium uppercase font-mono">
                    {effectiveUser?.role || 'ADMIN'}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  id="admin-header-user-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{effectiveUser?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{effectiveUser?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>Site & SEO Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout('/login');
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Public Website */}
            <a
              id="admin-header-view-website-btn"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-pink-50 hover:text-pink-600 text-stone-700 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition"
              title="View Public Site"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pink-600" />
              <span>View Site</span>
            </a>
          </div>
        </header>

        {/* Global Search Dialog Modal */}
        {searchModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
              <form onSubmit={handleSearchSubmit} className="p-4 border-b border-stone-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-pink-600 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search articles, authors, categories or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm text-stone-900 placeholder-stone-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              <div className="p-3 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Press <strong>Enter</strong> to search</span>
                <kbd className="font-mono bg-white border border-stone-200 px-1.5 py-0.5 rounded">ESC to close</kbd>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main id="admin-main-content-scroll" className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

