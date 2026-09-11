import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getEditorStats } from '@/db/repository';
import {
  FileText,
  Clock,
  CheckCircle2,
  FolderTree,
  Tag,
  Plus,
  ArrowUpRight,
  Edit,
  Send,
  Sparkles,
  Inbox,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { EditorReviewQueueWidget } from '@/components/editor/EditorReviewQueueWidget';

export const dynamic = 'force-dynamic';

export default async function EditorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const stats = await getEditorStats();

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 border border-purple-700/40 text-purple-300 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editorial Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-stone-100">
              Welcome, Editor {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Curate, review author drafts, manage categories, and publish stories across Naya Andaaz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {stats.pendingCount > 0 && (
              <Link
                href="/editor/posts/review"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition"
              >
                <Inbox className="w-4 h-4" />
                <span>Review Queue ({stats.pendingCount})</span>
              </Link>
            )}

            <Link
              href="/editor/posts/add-post"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Posts */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <FileText className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-black text-stone-900">{stats.totalPosts}</p>
          <span className="text-[10px] text-stone-400 font-medium">All articles</span>
        </div>

        {/* Pending Review Queue */}
        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-2xs space-y-1 bg-purple-50/20">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Review Queue</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-serif font-black text-purple-700">{stats.pendingCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Awaiting approval</span>
        </div>

        {/* Published */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-serif font-black text-emerald-600">{stats.publishedCount}</p>
          <span className="text-[10px] text-stone-400 font-medium">Live on site</span>
        </div>

        {/* Drafts */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drafts</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif font-black text-amber-600">{stats.draftCount}</p>
          <span className="text-[10px] text-stone-400 font-medium">In progress</span>
        </div>

        {/* Categories */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Categories</span>
            <FolderTree className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-serif font-black text-stone-900">{stats.totalCategories}</p>
          <span className="text-[10px] text-stone-400 font-medium">Taxonomy terms</span>
        </div>

        {/* Tags */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tags</span>
            <Tag className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-serif font-black text-stone-900">{stats.totalTags}</p>
          <span className="text-[10px] text-stone-400 font-medium">Topic keywords</span>
        </div>
      </div>

      {/* 3. Pending Review Queue Widget with one-click actions */}
      <EditorReviewQueueWidget initialPosts={stats.pendingReviewPosts} />

      {/* 4. Recent Editorial Posts Table */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Recent Content Activity</h2>
            <p className="text-xs text-stone-500">Latest created, edited, and published articles across the newsroom</p>
          </div>

          <Link
            href="/editor/posts/all-posts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 transition"
          >
            <span>View All Articles</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Author</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Views</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stats.recentPosts.map((post) => {
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
                    <td className="px-6 py-4 font-semibold text-stone-900 max-w-xs truncate">
                      <Link
                        href={`/editor/posts/${post.id}`}
                        className="hover:text-pink-600 transition"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-stone-700 font-medium">
                      {post.author?.name || 'Staff'}
                    </td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4 text-stone-500">
                      {post.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-stone-700">
                      {(post.views || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/editor/posts/${post.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      {post.status === 'published' && (
                        <Link
                          href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 rounded-lg transition"
                          title="View Public Post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
