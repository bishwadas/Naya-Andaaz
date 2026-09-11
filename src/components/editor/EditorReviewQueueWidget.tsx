'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Edit,
  ExternalLink,
  Loader2,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { Post } from '@/types';

interface EditorReviewQueueWidgetProps {
  initialPosts: Post[];
}

export function EditorReviewQueueWidget({ initialPosts }: EditorReviewQueueWidgetProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (postId: string, newStatus: 'published' | 'draft') => {
    setActionLoadingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update post status');
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-purple-200 rounded-3xl overflow-hidden shadow-2xs">
      <div className="p-6 border-b border-purple-100 bg-purple-50/30 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">Editorial Review Queue</h2>
              {posts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-200 text-purple-800">
                  {posts.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Author submissions waiting for editorial review, proofreading, and approval
            </p>
          </div>
        </div>

        <Link
          href="/editor/posts/review"
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition"
        >
          <span>Open Full Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">All caught up!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No articles are currently waiting in the editorial review queue. All submissions have been reviewed.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-purple-50">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-purple-50/20 transition"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500">
                  <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <User className="w-3 h-3" />
                    {post.author?.name || 'Author'}
                  </span>
                  <span>•</span>
                  <span>{post.category?.name || 'General'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    Submitted {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  href={`/editor/posts/${post.id}`}
                  className="font-bold text-stone-900 hover:text-purple-700 transition block text-sm sm:text-base leading-snug truncate"
                >
                  {post.title}
                </Link>

                {post.excerpt && (
                  <p className="text-xs text-stone-500 line-clamp-1">{post.excerpt}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/editor/posts/${post.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Review</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(post.id, 'draft')}
                  disabled={actionLoadingId === post.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl transition disabled:opacity-50"
                  title="Send back to draft for author edits"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(post.id, 'published')}
                  disabled={actionLoadingId === post.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {actionLoadingId === post.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
