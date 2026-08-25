'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Post } from '@/types';

interface AuthorPostsClientProps {
  initialPosts: Post[];
  authorName: string;
}

export function AuthorPostsClient({ initialPosts, authorName }: AuthorPostsClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.status === 'published') ||
      (statusFilter === 'pending' && post.status === 'pending') ||
      (statusFilter === 'draft' && post.status === 'draft');

    return matchesSearch && matchesStatus;
  });

  // Handle Delete Draft / Post
  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setDeletingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete article');
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      alert(err.message || 'Error deleting article');
    } finally {
      setDeletingId(null);
    }
  };

  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const pendingCount = posts.filter((p) => p.status === 'pending').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
            My Articles
          </h1>
          <p className="text-xs text-stone-500">
            Manage your articles, check editorial review statuses, and track views
          </p>
        </div>

        <Link
          href="/author/posts/all-posts/add-post"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              In Review ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Published ({publishedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search my articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-700">No articles found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No articles match your search filter.'
              : 'You do not have any articles in this status.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Article</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPosts.map((post) => {
                  const statusBadge =
                    post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : post.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        <Clock className="w-3 h-3" /> In Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <FileText className="w-3 h-3" /> Draft
                      </span>
                    );

                  return (
                    <tr key={post.id} className="hover:bg-stone-50/80 transition">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="space-y-1">
                          <Link
                            href={`/author/posts/${post.id}`}
                            className="font-bold text-stone-900 hover:text-pink-600 transition block text-sm leading-snug line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{statusBadge}</td>
                      <td className="px-6 py-4 font-medium text-stone-600">
                        {post.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-stone-800">
                        {(post.views || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/author/posts/${post.id}`}
                            className="p-1.5 text-stone-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {post.status === 'published' && (
                            <Link
                              href={`/${post.slug}`}
                              target="_blank"
                              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              title="View Live Article"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Article"
                          >
                            {deletingId === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
