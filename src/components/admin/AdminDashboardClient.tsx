'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRouteId } from '@/components/admin/AdminSidebar';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { TagsManager } from '@/components/admin/TagsManager';
import { PostsManager } from '@/components/admin/PostsManager';
import { PagesManager } from '@/components/admin/PagesManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { CommentsManager } from '@/components/admin/CommentsManager';
import { NavigationManager } from '@/components/admin/NavigationManager';
import { VideosManager } from '@/components/admin/VideosManager';
import { NewsletterManager } from '@/components/admin/NewsletterManager';
import { AdsManager } from '@/components/admin/AdsManager';
import { ActivityLogsManager } from '@/components/admin/ActivityLogsManager';
import { NotificationsManager } from '@/components/admin/NotificationsManager';
import { ProfileManager } from '@/components/admin/ProfileManager';
import { SettingsManager } from '@/components/admin/SettingsManager';
import { TrashManager } from '@/components/admin/TrashManager';
import { RefreshCw } from 'lucide-react';
import { Post, Category, Tag, MediaItem, Comment, User, SiteSettings } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface AdminDashboardClientProps {
  initialUser: User;
  initialRoute?: AdminRouteId;
}

export function AdminDashboardClient({
  initialUser,
  initialRoute = 'dashboard',
}: AdminDashboardClientProps) {
  const { currentUser: clientUser } = useAuth();
  const currentUser = clientUser || initialUser;
  const [currentRoute, setCurrentRoute] = useState<AdminRouteId>(initialRoute);

  // Admin Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  useEffect(() => {
    if (currentRoute === 'posts_add') {
      window.location.href = '/admin/posts/new';
    } else if (currentRoute === 'pages_add') {
      window.location.href = '/admin/pages/new';
    }
  }, [currentRoute]);

  const fetchAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [pRes, cRes, tRes, mRes, comRes, uRes, sRes, metRes] = await Promise.all([
        fetch('/api/posts').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/categories').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/tags').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/media').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/comments').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/users').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/settings').then((r) => parseApiResponse<any>(r)).catch(() => null),
        fetch('/api/metrics').then((r) => parseApiResponse<any>(r)).catch(() => null),
      ]);

      setPosts(Array.isArray(pRes) ? pRes : pRes?.posts || []);
      setCategories(Array.isArray(cRes) ? cRes : []);
      setTags(Array.isArray(tRes) ? tRes : []);
      setMedia(Array.isArray(mRes) ? mRes : []);
      setComments(Array.isArray(comRes) ? comRes : comRes?.comments || []);
      setUsers(Array.isArray(uRes) ? uRes : []);
      setSettings(sRes);
      setMetrics(metRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <AdminLayout
      currentRoute={currentRoute}
      onRouteChange={setCurrentRoute}
      onViewFrontend={() => window.open('/', '_blank')}
      badgeCounts={{
        pendingPosts: posts.filter((p) => p.status === 'pending').length,
        pendingComments: comments.filter((c) => c.status === 'pending').length,
      }}
    >
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 uppercase tracking-wider">
              {currentRoute.replace('_', ' ')}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Connected to PostgreSQL Database via Drizzle ORM • Role: <span className="text-pink-600 font-bold uppercase">{currentUser?.role || 'ADMIN'}</span>
            </p>
          </div>
          <button
            onClick={fetchAllAdminData}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-pink-600' : ''}`} /> Refresh Data
          </button>
        </div>

        {/* Route / Module View Renderer */}
        {currentRoute === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-2 shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">Total Articles</span>
                <div className="text-3xl font-serif font-bold text-stone-900">{posts.length}</div>
                <div className="text-xs text-emerald-600 font-medium">+3 published today</div>
              </div>
              <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-2 shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">Categories</span>
                <div className="text-3xl font-serif font-bold text-stone-900">{categories.length}</div>
                <div className="text-xs text-stone-500 font-medium">Active taxonomy sectors</div>
              </div>
              <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-2 shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">Comments Queue</span>
                <div className="text-3xl font-serif font-bold text-stone-900">{comments.length}</div>
                <div className="text-xs text-amber-600 font-medium">{comments.filter((c) => c.status === 'pending').length} pending review</div>
              </div>
              <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-2 shadow-xs">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">User Accounts</span>
                <div className="text-3xl font-serif font-bold text-stone-900">{users.length}</div>
                <div className="text-xs text-emerald-600 font-medium">RBAC active</div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-stone-900">Recent Editorial Activity</h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 text-sm">
                    <div>
                      <div className="font-serif font-semibold text-stone-800">{post.title}</div>
                      <div className="text-xs text-stone-500">By {post.author?.name || 'Staff'} • {post.status}</div>
                    </div>
                    <span className="text-xs text-stone-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(currentRoute === 'posts_all' || currentRoute === 'posts_add') && (
          <PostsManager
            initialPosts={posts}
            categories={categories}
            users={users}
            initialMode={currentRoute === 'posts_add' ? 'add' : 'all'}
            onPostsUpdated={fetchAllAdminData}
          />
        )}

        {currentRoute === 'tags' && (
          <TagsManager onTagsUpdated={fetchAllAdminData} />
        )}

        {currentRoute === 'categories' && (
          <CategoriesManager
            categories={categories}
            onCategoriesUpdated={fetchAllAdminData}
          />
        )}

        {(currentRoute === 'pages_all' || currentRoute === 'pages_add') && (
          <PagesManager
            initialPages={[]}
            initialMode={currentRoute === 'pages_add' ? 'add' : 'all'}
            onPagesUpdated={fetchAllAdminData}
          />
        )}

        {(currentRoute === 'users_all' || currentRoute === 'users_add') && (
          <UsersManager
            initialUsers={users}
            initialMode={currentRoute === 'users_add' ? 'add' : 'all'}
            onUsersUpdated={fetchAllAdminData}
          />
        )}

        {currentRoute === 'comments' && (
          <CommentsManager
            initialComments={comments}
            onCommentsUpdated={fetchAllAdminData}
          />
        )}

        {currentRoute === 'navigation' && (
          <NavigationManager categories={categories} />
        )}

        {currentRoute === 'videos' && (
          <VideosManager categories={categories} />
        )}

        {currentRoute === 'newsletter' && (
          <NewsletterManager />
        )}

        {currentRoute === 'advertisements' && (
          <AdsManager />
        )}

        {currentRoute === 'activity_logs' && (
          <ActivityLogsManager />
        )}

        {currentRoute === 'notifications' && (
          <NotificationsManager />
        )}

        {currentRoute === 'trash' && (
          <TrashManager />
        )}

        {currentRoute === 'profile' && (
          <ProfileManager />
        )}

        {currentRoute === 'settings' && (
          <SettingsManager />
        )}
      </div>
    </AdminLayout>
  );
}
