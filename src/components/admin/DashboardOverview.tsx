'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  MessageSquare,
  Users as UsersIcon,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Eye,
  Plus,
  Clock,
  ShieldCheck,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Post, Category, Comment, User } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface DashboardOverviewProps {
  initialPosts?: Post[];
  initialCategories?: Category[];
  initialComments?: Comment[];
  initialUsers?: User[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  initialPosts = [],
  initialCategories = [],
  initialComments = [],
  initialUsers = [],
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, comRes, uRes] = await Promise.all([
        fetch('/api/posts').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/categories').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/comments').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/users').then((r) => parseApiResponse<any>(r)).catch(() => []),
      ]);

      setPosts(Array.isArray(pRes) ? pRes : pRes?.posts || []);
      setCategories(Array.isArray(cRes) ? cRes : []);
      setComments(Array.isArray(comRes) ? comRes : comRes?.comments || []);
      setUsers(Array.isArray(uRes) ? uRes : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');
  const pendingComments = comments.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Editorial Dashboard Overview
            </h1>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time analytics, editorial pipeline metrics, and system status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="admin-dashboard-refresh-btn"
            onClick={fetchDashboardData}
            className="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-600' : ''}`} />
            Refresh Analytics
          </button>
          <Link
            href="/admin/posts/add-post"
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Article
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Posts */}
        <Link
          href="/admin/posts/all-posts"
          className="bg-white border border-stone-200 p-5 rounded-xl hover:border-pink-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 uppercase tracking-wider font-mono font-medium">
              Total Articles
            </span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 mt-2">
            {posts.length}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
            <span className="text-emerald-600 font-semibold">{publishedPosts.length} published</span>
            <span>•</span>
            <span className="text-stone-400">{draftPosts.length} drafts</span>
          </div>
        </Link>

        {/* Metric 2: Categories */}
        <Link
          href="/admin/posts/categories"
          className="bg-white border border-stone-200 p-5 rounded-xl hover:border-pink-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 uppercase tracking-wider font-mono font-medium">
              Taxonomy Sectors
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 mt-2">
            {categories.length}
          </div>
          <div className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100 flex items-center gap-1">
            <span>Primary editorial categories</span>
          </div>
        </Link>

        {/* Metric 3: Comments */}
        <Link
          href="/admin/comments"
          className="bg-white border border-stone-200 p-5 rounded-xl hover:border-pink-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 uppercase tracking-wider font-mono font-medium">
              Comments Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 mt-2">
            {comments.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2 pt-2 border-t border-stone-100">
            {pendingComments.length > 0 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {pendingComments.length} pending moderation
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">All comments moderated</span>
            )}
          </div>
        </Link>

        {/* Metric 4: Users */}
        <Link
          href="/admin/users"
          className="bg-white border border-stone-200 p-5 rounded-xl hover:border-pink-300 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 uppercase tracking-wider font-mono font-medium">
              Authors & Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900 mt-2">
            {users.length}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-2 pt-2 border-t border-stone-100 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> RBAC Access Control active
          </div>
        </Link>
      </div>

      {/* 2-Column Section: Recent Posts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Editorial Activity */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-600" /> Recent Editorial Activity
            </h3>
            <Link
              href="/admin/posts/all-posts"
              className="text-xs text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
            >
              <span>View All Posts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {posts.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs font-mono">
                No editorial posts available yet.
              </div>
            ) : (
              posts.slice(0, 6).map((post) => (
                <div
                  key={post.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50/60 transition px-2 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-serif font-semibold text-stone-900 hover:text-pink-600 text-sm transition truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                      <span>By {post.author?.name || 'Staff Author'}</span>
                      <span>•</span>
                      <span
                        className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-stone-400 font-mono shrink-0">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Links / CMS Shortcuts */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-stone-900">CMS Quick Actions</h3>
            <div className="space-y-2 text-xs font-medium">
              <Link
                href="/admin/posts/add-post"
                className="flex items-center justify-between p-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 transition"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> New Editorial Article
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/pages/new"
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Create Static Page
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Media Library Vault
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Site Configuration & SEO
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-xl p-5 shadow-xs space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-pink-200 font-semibold">
              Sereia Magazine Engine
            </div>
            <div className="font-serif font-bold text-lg">Next.js & Drizzle ORM</div>
            <p className="text-xs text-pink-100 leading-relaxed">
              Every route and sub-section is modularized with server-side validation and responsive navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
