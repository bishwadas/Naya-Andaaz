import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAuthorStats } from '@/db/repository';
import {
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  Heart,
  Plus,
  ArrowUpRight,
  Edit,
  Send,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuthorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const stats = await getAuthorStats(user.id);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-950/80 border border-pink-700/40 text-pink-400 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Author Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-stone-100">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
              Write, polish, and submit your articles for editorial review. Track your post views and publishing progress in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/author/posts/all-posts/add-post"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Article</span>
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
          <span className="text-[10px] text-stone-400 font-medium">Authored pieces</span>
        </div>

        {/* Drafts */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif font-black text-amber-600">{stats.draftCount}</p>
          <span className="text-[10px] text-stone-400 font-medium">In progress</span>
        </div>

        {/* Pending Review */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Review</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-serif font-black text-purple-600">{stats.pendingCount}</p>
          <span className="text-[10px] text-stone-400 font-medium">Awaiting editor</span>
        </div>

        {/* Published */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-serif font-black text-emerald-600">{stats.publishedCount}</p>
          <span className="text-[10px] text-stone-400 font-medium">Published online</span>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-serif font-black text-blue-600">{stats.totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-stone-400 font-medium">Article readers</span>
        </div>

        {/* Total Likes */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Likes</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-serif font-black text-rose-600">{stats.totalLikes.toLocaleString()}</p>
          <span className="text-[10px] text-stone-400 font-medium">Reader reactions</span>
        </div>
      </div>

      {/* 3. Post Workflow Status Guide */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">Editorial Workflow Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>1. Draft Mode</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Write and auto-save your story. When ready for editorial verification, click <strong>Submit for Review</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>2. Editorial Review</span>
            </div>
            <p className="text-xs text-purple-900/80 leading-relaxed">
              Our Editors review formatting, factuality, and SEO. Articles are locked for review until approved or returned.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>3. Published Live</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Once approved, your article goes live on Naya Andaaz and appears in your public Author Profile.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recent Posts Table */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Your Recent Articles</h2>
            <p className="text-xs text-stone-500">Manage and check status of your latest submissions</p>
          </div>

          <Link
            href="/author/posts/all-posts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 transition"
          >
            <span>View All ({stats.totalPosts})</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {stats.recentPosts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-700">No articles created yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Get started by creating your first article draft.
            </p>
            <Link
              href="/author/posts/all-posts/add-post"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-full transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write First Post</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Views</th>
                  <th className="px-6 py-3.5">Last Updated</th>
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
                          href={`/author/posts/${post.id}`}
                          className="hover:text-pink-600 transition"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{statusBadge}</td>
                      <td className="px-6 py-4 text-stone-500 font-medium">
                        {post.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-stone-700">
                        {(post.views || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/author/posts/${post.id}`}
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
        )}
      </div>
    </div>
  );
}
