'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag as TagIcon,
  Image as ImageIcon,
  FileCode,
  Users as UsersIcon,
  UserPlus,
  MessageSquare,
  Menu as MenuIcon,
  Video as VideoIcon,
  Mail,
  Megaphone,
  History,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  Check,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { Role as UserRole } from '@/types';

export type AdminRouteId =
  | 'dashboard'
  | 'posts_all'
  | 'posts_add'
  | 'categories'
  | 'tags'
  | 'media'
  | 'pages_all'
  | 'pages_add'
  | 'users_all'
  | 'users_add'
  | 'comments'
  | 'navigation'
  | 'videos'
  | 'newsletter'
  | 'advertisements'
  | 'activity_logs'
  | 'notifications'
  | 'trash'
  | 'profile'
  | 'settings';

export interface AdminNavSubItem {
  id: AdminRouteId;
  label: string;
  href: string;
  badge?: string | number;
  badgeColor?: string;
  requiredPermission?: 'manage_settings' | 'manage_users' | 'manage_categories' | 'manage_pages' | 'manage_media' | 'create_posts' | 'edit_all_posts' | 'publish_posts';
}

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  routeId?: AdminRouteId;
  href?: string;
  subItems?: AdminNavSubItem[];
  badge?: string | number;
  badgeColor?: string;
  requiredPermission?: 'manage_settings' | 'manage_users' | 'manage_categories' | 'manage_pages' | 'manage_media' | 'create_posts' | 'edit_all_posts' | 'publish_posts';
}

export interface SidebarBadgeCounts {
  pendingPosts?: number;
  pendingComments?: number;
  unreadNotifications?: number;
  newsletterSubscribers?: number;
}

export const ADMIN_NAV_CONFIG: AdminNavItem[] = [
  {
    id: 'dashboard_group',
    label: 'Dashboard',
    icon: LayoutDashboard,
    routeId: 'dashboard',
    href: '/admin/dashboard',
  },
  {
    id: 'posts_group',
    label: 'Posts',
    icon: FileText,
    subItems: [
      { id: 'posts_all', label: 'All Posts', href: '/admin/posts/all-posts' },
      { id: 'posts_add', label: 'Add Post', href: '/admin/posts/add-post', requiredPermission: 'create_posts' },
      { id: 'categories', label: 'Categories', href: '/admin/posts/categories', requiredPermission: 'manage_categories' },
      { id: 'tags', label: 'Tags', href: '/admin/posts/tags', requiredPermission: 'manage_categories' },
    ],
  },
  {
    id: 'media_group',
    label: 'Media',
    icon: ImageIcon,
    routeId: 'media',
    href: '/admin/media',
    requiredPermission: 'manage_media',
  },
  {
    id: 'pages_group',
    label: 'Pages',
    icon: FileCode,
    subItems: [
      { id: 'pages_all', label: 'All Pages', href: '/admin/pages/all-pages' },
      { id: 'pages_add', label: 'Add Page', href: '/admin/pages/new', requiredPermission: 'manage_pages' },
    ],
    requiredPermission: 'manage_pages',
  },
  {
    id: 'users_group',
    label: 'Users',
    icon: UsersIcon,
    subItems: [
      { id: 'users_all', label: 'All Users', href: '/admin/users' },
      { id: 'users_add', label: 'Add User', href: '/admin/users/add-user', requiredPermission: 'manage_users' },
    ],
    requiredPermission: 'manage_users',
  },
  {
    id: 'comments_group',
    label: 'Comments',
    icon: MessageSquare,
    routeId: 'comments',
    href: '/admin/comments',
  },
  {
    id: 'navigation_group',
    label: 'Navigation',
    icon: MenuIcon,
    routeId: 'navigation',
    href: '/admin/navigation',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'videos_group',
    label: 'Videos',
    icon: VideoIcon,
    routeId: 'videos',
    href: '/admin/videos',
  },
  {
    id: 'newsletter_group',
    label: 'Newsletter',
    icon: Mail,
    routeId: 'newsletter',
    href: '/admin/newsletter',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'advertisements_group',
    label: 'Advertisements',
    icon: Megaphone,
    routeId: 'advertisements',
    href: '/admin/advertisements',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'activity_logs_group',
    label: 'Activity Logs',
    icon: History,
    routeId: 'activity_logs',
    href: '/admin/activity-logs',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'notifications_group',
    label: 'Notifications',
    icon: Bell,
    routeId: 'notifications',
    href: '/admin/notifications',
  },
  {
    id: 'trash_group',
    label: 'Trash',
    icon: Trash2,
    routeId: 'trash',
    href: '/admin/trash',
  },
  {
    id: 'profile_group',
    label: 'Profile',
    icon: UserIcon,
    routeId: 'profile',
    href: '/admin/profile',
  },
  {
    id: 'settings_group',
    label: 'Settings',
    icon: SettingsIcon,
    routeId: 'settings',
    href: '/admin/settings',
    requiredPermission: 'manage_settings',
  },
];

export function getRouteIdFromPathname(pathname: string): AdminRouteId {
  const cleanPath = pathname.replace(/\/$/, '');

  if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') return 'dashboard';
  if (cleanPath === '/admin/posts/all-posts' || cleanPath === '/admin/posts') return 'posts_all';
  if (cleanPath === '/admin/posts/add-post' || cleanPath === '/admin/posts/new') return 'posts_add';
  if (cleanPath === '/admin/posts/categories') return 'categories';
  if (cleanPath === '/admin/posts/tags') return 'tags';
  if (cleanPath === '/admin/media') return 'media';
  if (cleanPath === '/admin/pages/all-pages' || cleanPath === '/admin/pages') return 'pages_all';
  if (cleanPath === '/admin/pages/new' || cleanPath === '/admin/pages/add-page') return 'pages_add';
  if (cleanPath === '/admin/users/add-user' || cleanPath === '/admin/users/new') return 'users_add';
  if (cleanPath.startsWith('/admin/users')) return 'users_all';
  if (cleanPath.startsWith('/admin/comments')) return 'comments';
  if (cleanPath.startsWith('/admin/navigation')) return 'navigation';
  if (cleanPath.startsWith('/admin/videos')) return 'videos';
  if (cleanPath.startsWith('/admin/newsletter')) return 'newsletter';
  if (cleanPath.startsWith('/admin/advertisements') || cleanPath.startsWith('/admin/ads')) return 'advertisements';
  if (cleanPath.startsWith('/admin/activity-logs') || cleanPath.startsWith('/admin/activity_logs')) return 'activity_logs';
  if (cleanPath.startsWith('/admin/notifications')) return 'notifications';
  if (cleanPath.startsWith('/admin/trash')) return 'trash';
  if (cleanPath.startsWith('/admin/profile')) return 'profile';
  if (cleanPath.startsWith('/admin/settings')) return 'settings';

  return 'dashboard';
}

interface AdminSidebarProps {
  currentRoute?: AdminRouteId;
  onRouteChange?: (route: AdminRouteId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewFrontend?: () => void;
  badgeCounts?: SidebarBadgeCounts;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute: propCurrentRoute,
  onRouteChange,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onViewFrontend,
  badgeCounts,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = propCurrentRoute || getRouteIdFromPathname(pathname);
  const { currentUser, switchUserRole, logout, isLoggingOut, can } = useAuth();

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoggingOut) return;
    await logout('/login');
  };

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    posts_group: pathname.includes('/admin/posts'),
    pages_group: pathname.includes('/admin/pages'),
    users_group: pathname.includes('/admin/users'),
  });
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-expand group when a child route is active
  useEffect(() => {
    ADMIN_NAV_CONFIG.forEach((item) => {
      if (item.subItems) {
        const isChildActive = item.subItems.some((sub) => sub.id === currentRoute || pathname.startsWith(sub.href));
        if (isChildActive) {
          setOpenSubmenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [currentRoute, pathname]);

  // Lock body scroll on mobile drawer open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenMobile]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpenMobile) onCloseMobile();
        if (roleSwitcherOpen) setRoleSwitcherOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile, roleSwitcherOpen]);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubmenu = (groupId: string) => {
    if (isCollapsed) {
      onToggleCollapse();
    }
    setOpenSubmenus((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLinkClick = () => {
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const isItemActive = (item: AdminNavItem): boolean => {
    if (item.href && (pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)))) {
      return true;
    }
    if (item.routeId && item.routeId === currentRoute) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some((sub) => sub.id === currentRoute || pathname.startsWith(sub.href));
    }
    return false;
  };

  // Filter items according to permissions
  const visibleNavItems = ADMIN_NAV_CONFIG.filter((item) => {
    if (item.requiredPermission && !can(item.requiredPermission)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          id="admin-sidebar-overlay"
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        id="admin-main-sidebar"
        role="navigation"
        aria-label="Admin Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white text-stone-800 border-r border-stone-200 shadow-sm transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-200 bg-white shrink-0">
          <Link
            href="/admin/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shrink-0">
              S
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-base text-stone-900 tracking-tight truncate">
                    Sereia
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-200">
                    CMS
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 truncate">Editorial & News Platform</div>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            id="admin-sidebar-mobile-close-btn"
            type="button"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Toggle */}
          <button
            id="admin-sidebar-collapse-btn"
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Action: View Public Site */}
        <div className={`p-2 border-b border-stone-100 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <a
            id="admin-sidebar-view-site-btn"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-pink-600 bg-stone-50 hover:bg-pink-50/50 border border-stone-200 rounded-md transition group ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="View Public Editorial Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform shrink-0" />
            {!isCollapsed && <span className="truncate font-semibold">View Public Site</span>}
          </a>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-1 custom-scrollbar">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            const active = isItemActive(item);
            const isSubOpen = Boolean(openSubmenus[item.id]);

            // Filter sub-items by permission
            const visibleSubItems = item.subItems?.filter(
              (sub) => !sub.requiredPermission || can(sub.requiredPermission)
            );

            // Compute dynamic badges
            let dynamicBadge: string | number | undefined = item.badge;
            let dynamicBadgeColor = item.badgeColor || 'bg-stone-100 text-stone-700';

            if (item.id === 'posts_group' && badgeCounts?.pendingPosts) {
              dynamicBadge = badgeCounts.pendingPosts;
              dynamicBadgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
            } else if (item.id === 'comments_group' && badgeCounts?.pendingComments) {
              dynamicBadge = badgeCounts.pendingComments;
              dynamicBadgeColor = 'bg-pink-100 text-pink-700 border border-pink-300';
            } else if (item.id === 'notifications_group' && badgeCounts?.unreadNotifications) {
              dynamicBadge = badgeCounts.unreadNotifications;
              dynamicBadgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
            } else if (item.id === 'newsletter_group' && badgeCounts?.newsletterSubscribers) {
              dynamicBadge = badgeCounts.newsletterSubscribers;
              dynamicBadgeColor = 'bg-blue-100 text-blue-800 border border-blue-300';
            }

            return (
              <div key={item.id} className="relative group">
                {/* Single Link or Group Trigger */}
                {hasSub ? (
                  <button
                    id={`admin-nav-group-${item.id}`}
                    type="button"
                    onClick={() => toggleSubmenu(item.id)}
                    aria-expanded={isSubOpen}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                      active
                        ? 'bg-pink-50 text-pink-700 border border-pink-200 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-pink-600' : 'text-stone-500 group-hover:text-stone-900'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {dynamicBadge !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${dynamicBadgeColor}`}>
                            {dynamicBadge}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                            isSubOpen ? 'rotate-180 text-pink-600' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    id={`admin-nav-item-${item.id}`}
                    href={item.href || '/admin/dashboard'}
                    onClick={handleLinkClick}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                      active
                        ? 'bg-pink-600 text-white font-semibold shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-stone-500 group-hover:text-stone-900'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && dynamicBadge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        active ? 'bg-pink-700 text-white' : dynamicBadgeColor
                      }`}>
                        {dynamicBadge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu Items (Expanded in full mode) */}
                {hasSub && visibleSubItems && !isCollapsed && isSubOpen && (
                  <div
                    id={`admin-sub-menu-${item.id}`}
                    className="mt-1 ml-4 pl-3 border-l border-stone-200 space-y-0.5"
                  >
                    {visibleSubItems.map((sub) => {
                      const isSubActive = pathname === sub.href || (sub.href !== '/admin/posts/all-posts' && pathname.startsWith(sub.href));
                      return (
                        <Link
                          key={sub.id}
                          id={`admin-nav-subitem-${sub.id}`}
                          href={sub.href}
                          onClick={handleLinkClick}
                          aria-current={isSubActive ? 'page' : undefined}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition ${
                            isSubActive
                              ? 'text-pink-600 bg-pink-50 font-bold border-l-2 border-pink-600 pl-2'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge !== undefined && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-stone-200 text-stone-700">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile & Role Switcher Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/80 relative" ref={roleDropdownRef}>
          {roleSwitcherOpen && (
            <div
              id="admin-role-switcher-dropdown"
              className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-stone-200 rounded-lg p-2 shadow-xl z-50 space-y-1"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 px-2 py-1 border-b border-stone-200">
                Switch Role Simulation (RBAC)
              </div>
              {(['admin', 'editor', 'author', 'subscriber'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  id={`admin-switch-role-${role}`}
                  type="button"
                  onClick={() => {
                    switchUserRole(role);
                    setRoleSwitcherOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded text-left capitalize transition ${
                    (currentUser?.role || 'admin') === role
                      ? 'bg-pink-50 text-pink-700 font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-stone-500" />
                    {role}
                  </span>
                  {(currentUser?.role || 'admin') === role && <Check className="w-3.5 h-3.5 text-pink-600" />}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className={`flex items-center gap-2.5 min-w-0 cursor-pointer rounded-lg hover:bg-stone-200/60 p-1.5 -m-1.5 transition ${
                isCollapsed ? 'justify-center w-full' : 'flex-1'
              }`}
              title={`${currentUser?.name || 'Administrator'} (${currentUser?.role || 'admin'}) — Click to switch role`}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover bg-stone-200 border border-stone-300 shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-800 truncate leading-tight">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono uppercase font-semibold text-pink-700 px-1 py-0.2 rounded bg-pink-100 border border-pink-200 leading-none">
                      {currentUser?.role || 'admin'}
                    </span>
                    <span className="text-[10px] text-stone-400">▼</span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                id="admin-sidebar-logout-btn"
                type="button"
                aria-label="Logout"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="p-1.5 text-stone-400 hover:text-pink-600 hover:bg-stone-200/70 rounded-md transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isLoggingOut ? 'Logging out...' : 'Logout'}
              >
                <LogOut className={`w-4 h-4 ${isLoggingOut ? 'animate-pulse text-pink-600' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
