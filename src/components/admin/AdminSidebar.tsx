'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
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
  badge?: string | number;
  badgeColor?: string;
  requiredPermission?: 'manage_settings' | 'manage_users' | 'manage_categories' | 'manage_pages' | 'manage_media' | 'create_posts' | 'edit_all_posts' | 'publish_posts';
}

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  routeId?: AdminRouteId;
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

interface AdminSidebarProps {
  currentRoute: AdminRouteId;
  onRouteChange: (route: AdminRouteId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewFrontend?: () => void;
  badgeCounts?: SidebarBadgeCounts;
}

export const ADMIN_NAV_CONFIG: AdminNavItem[] = [
  {
    id: 'dashboard_group',
    label: 'Dashboard',
    icon: LayoutDashboard,
    routeId: 'dashboard',
  },
  {
    id: 'posts_group',
    label: 'Posts',
    icon: FileText,
    subItems: [
      { id: 'posts_all', label: 'All Posts' },
      { id: 'posts_add', label: 'Add Post', requiredPermission: 'create_posts' },
      { id: 'categories', label: 'Categories', requiredPermission: 'manage_categories' },
      { id: 'tags', label: 'Tags', requiredPermission: 'manage_categories' },
    ],
  },
  {
    id: 'media_group',
    label: 'Media',
    icon: ImageIcon,
    routeId: 'media',
    requiredPermission: 'manage_media',
  },
  {
    id: 'pages_group',
    label: 'Pages',
    icon: FileCode,
    subItems: [
      { id: 'pages_all', label: 'All Pages' },
      { id: 'pages_add', label: 'Add Page', requiredPermission: 'manage_pages' },
    ],
    requiredPermission: 'manage_pages',
  },
  {
    id: 'users_group',
    label: 'Users',
    icon: UsersIcon,
    subItems: [
      { id: 'users_all', label: 'All Users' },
      { id: 'users_add', label: 'Add User', requiredPermission: 'manage_users' },
    ],
    requiredPermission: 'manage_users',
  },
  {
    id: 'comments_group',
    label: 'Comments',
    icon: MessageSquare,
    routeId: 'comments',
  },
  {
    id: 'navigation_group',
    label: 'Navigation',
    icon: MenuIcon,
    routeId: 'navigation',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'videos_group',
    label: 'Videos',
    icon: VideoIcon,
    routeId: 'videos',
  },
  {
    id: 'newsletter_group',
    label: 'Newsletter',
    icon: Mail,
    routeId: 'newsletter',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'advertisements_group',
    label: 'Advertisements',
    icon: Megaphone,
    routeId: 'advertisements',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'activity_logs_group',
    label: 'Activity Logs',
    icon: History,
    routeId: 'activity_logs',
    requiredPermission: 'manage_settings',
  },
  {
    id: 'notifications_group',
    label: 'Notifications',
    icon: Bell,
    routeId: 'notifications',
  },
  {
    id: 'trash_group',
    label: 'Trash',
    icon: Trash2,
    routeId: 'trash',
  },
  {
    id: 'profile_group',
    label: 'Profile',
    icon: UserIcon,
    routeId: 'profile',
  },
  {
    id: 'settings_group',
    label: 'Settings',
    icon: SettingsIcon,
    routeId: 'settings',
    requiredPermission: 'manage_settings',
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onViewFrontend,
  badgeCounts,
}) => {
  const { currentUser, switchUserRole, logout, can } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    posts_group: true,
    pages_group: false,
    users_group: false,
  });
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-expand group when a child route is active
  useEffect(() => {
    ADMIN_NAV_CONFIG.forEach((item) => {
      if (item.subItems) {
        const isChildActive = item.subItems.some((sub) => sub.id === currentRoute);
        if (isChildActive) {
          setOpenSubmenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [currentRoute]);

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

  const handleNavClick = (routeId: AdminRouteId) => {
    onRouteChange(routeId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const isItemActive = (item: AdminNavItem): boolean => {
    if (item.routeId) {
      return item.routeId === currentRoute;
    }
    if (item.subItems) {
      return item.subItems.some((sub) => sub.id === currentRoute);
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-stone-950 text-stone-200 border-r border-stone-800 transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shrink-0">
              S
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-base text-stone-100 tracking-tight truncate">
                    Sereia
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                    CMS
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 truncate">Editorial & News Platform</div>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            id="admin-sidebar-mobile-close-btn"
            type="button"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Toggle */}
          <button
            id="admin-sidebar-collapse-btn"
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Action: View Public Site */}
        {onViewFrontend && (
          <div className={`p-2 border-b border-stone-800/60 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            <button
              id="admin-sidebar-view-site-btn"
              type="button"
              onClick={onViewFrontend}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-850 border border-stone-800 rounded-md transition group ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
              title="View Public Editorial Website"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
              {!isCollapsed && <span className="truncate">View Public Site</span>}
            </button>
          </div>
        )}

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
            let dynamicBadgeColor = item.badgeColor || 'bg-stone-800 text-stone-300';

            if (item.id === 'posts_group' && badgeCounts?.pendingPosts) {
              dynamicBadge = badgeCounts.pendingPosts;
              dynamicBadgeColor = 'bg-amber-950 text-amber-300 border border-amber-800/60';
            } else if (item.id === 'comments_group' && badgeCounts?.pendingComments) {
              dynamicBadge = badgeCounts.pendingComments;
              dynamicBadgeColor = 'bg-rose-950 text-rose-300 border border-rose-800/60';
            } else if (item.id === 'notifications_group' && badgeCounts?.unreadNotifications) {
              dynamicBadge = badgeCounts.unreadNotifications;
              dynamicBadgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800/60';
            } else if (item.id === 'newsletter_group' && badgeCounts?.newsletterSubscribers) {
              dynamicBadge = badgeCounts.newsletterSubscribers;
              dynamicBadgeColor = 'bg-blue-950 text-blue-300 border border-blue-800/60';
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
                        ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30 font-semibold'
                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-rose-400' : 'text-stone-400 group-hover:text-stone-200'}`} />
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
                            isSubOpen ? 'rotate-180 text-rose-400' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    id={`admin-nav-item-${item.id}`}
                    type="button"
                    onClick={() => item.routeId && handleNavClick(item.routeId)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                      active
                        ? 'bg-rose-600 text-white font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && dynamicBadge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        active ? 'bg-rose-700 text-white' : dynamicBadgeColor
                      }`}>
                        {dynamicBadge}
                      </span>
                    )}
                  </button>
                )}

                {/* Submenu Items (Expanded in full mode) */}
                {hasSub && visibleSubItems && !isCollapsed && isSubOpen && (
                  <div
                    id={`admin-sub-menu-${item.id}`}
                    className="mt-1 ml-4 pl-3 border-l border-stone-800/80 space-y-0.5"
                  >
                    {visibleSubItems.map((sub) => {
                      const isSubActive = sub.id === currentRoute;
                      return (
                        <button
                          key={sub.id}
                          id={`admin-nav-subitem-${sub.id}`}
                          type="button"
                          onClick={() => handleNavClick(sub.id)}
                          aria-current={isSubActive ? 'page' : undefined}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition ${
                            isSubActive
                              ? 'text-rose-400 bg-rose-950/40 font-semibold border-l-2 border-rose-500 pl-2'
                              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge !== undefined && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-stone-800 text-stone-400">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile & Role Switcher Footer */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/80 relative" ref={roleDropdownRef}>
          {roleSwitcherOpen && (
            <div
              id="admin-role-switcher-dropdown"
              className="absolute bottom-full left-3 right-3 mb-2 bg-stone-900 border border-stone-800 rounded-lg p-2 shadow-xl z-50 space-y-1"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-2 py-1 border-b border-stone-800">
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
                      ? 'bg-rose-950/60 text-rose-300 font-semibold'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-stone-400" />
                    {role}
                  </span>
                  {(currentUser?.role || 'admin') === role && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className={`flex items-center gap-2.5 min-w-0 cursor-pointer rounded-lg hover:bg-stone-900/60 p-1.5 -m-1.5 transition ${
                isCollapsed ? 'justify-center w-full' : 'flex-1'
              }`}
              title={`${currentUser?.name || 'Administrator'} (${currentUser?.role || 'admin'}) — Click to switch role`}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover bg-stone-800 border border-stone-700 shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-200 truncate leading-tight">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono uppercase font-semibold text-rose-400 px-1 py-0.2 rounded bg-rose-950/70 border border-rose-800/40 leading-none">
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
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-900 rounded-md transition shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
