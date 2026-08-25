'use client';

import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AdminSidebar, AdminRouteId } from './AdminSidebar';
import { useAuth } from '@/lib/auth-client';

interface AdminLayoutProps {
  currentRoute: AdminRouteId;
  onRouteChange: (route: AdminRouteId) => void;
  onViewFrontend?: () => void;
  badgeCounts?: {
    pendingPosts?: number;
    pendingComments?: number;
    unreadNotifications?: number;
    newsletterSubscribers?: number;
  };
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

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onRouteChange,
  onViewFrontend,
  badgeCounts,
  children,
}) => {
  const { currentUser } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const routeMeta = ROUTE_LABELS[currentRoute] || { title: 'Admin CMS', category: 'Sereia' };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onViewFrontend={onViewFrontend}
        badgeCounts={badgeCounts}
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
          className="h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Hamburger Button */}
            <button
              id="admin-mobile-drawer-toggle-btn"
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-xs text-stone-500 min-w-0">
              <span className="font-mono font-medium text-stone-500 hidden sm:inline">
                Sereia CMS
              </span>
              {routeMeta.category && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
                  <span className="text-stone-500 hidden sm:inline">{routeMeta.category}</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <h1 className="text-stone-900 font-bold truncate text-sm">
                {routeMeta.title}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
              <span className="text-stone-500 text-[11px]">Role:</span>
              <span className="font-mono uppercase font-bold text-pink-700 text-[11px]">
                {currentUser?.role || 'ADMIN'}
              </span>
            </div>

            {/* Notifications Button */}
            <button
              id="admin-header-notifications-btn"
              type="button"
              onClick={() => onRouteChange('notifications')}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {Boolean(badgeCounts?.unreadNotifications && badgeCounts.unreadNotifications > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-600 ring-2 ring-white" />
              )}
            </button>

            {/* View Public Website */}
            {onViewFrontend && (
              <button
                id="admin-header-view-website-btn"
                type="button"
                onClick={onViewFrontend}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white rounded text-xs font-semibold shadow-xs transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Site</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main id="admin-main-content-scroll" className="flex-1 p-4 md:p-6 lg:p-8 bg-stone-50/60">
          {children}
        </main>
      </div>
    </div>
  );
};
