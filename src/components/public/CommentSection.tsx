'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Comment } from '@/types';
import { useAuth } from '@/lib/auth-client';

export function CommentSection({ postId }: { postId: string }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setComments(Array.isArray(data) ? data : data?.comments || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, authorName: name, authorEmail: email, content }),
      });
      const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }
      setSuccess(true);
      setName('');
      setEmail('');
      setContent('');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-stone-200 pb-4">
        <MessageSquare className="w-5 h-5 text-amber-700" />
        <h3 className="text-2xl font-serif font-bold text-stone-950">Reader Discussion ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} suppressHydrationWarning className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h4 className="font-serif font-semibold text-stone-900">Join the Conversation</h4>
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Comment submitted successfully and is awaiting moderation.
          </div>
        )}
        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
            <input
              type="text"
              required
              suppressHydrationWarning
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address (optional)</label>
            <input
              type="email"
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eleanor@example.com"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Your Comment *</label>
          <textarea
            required
            rows={4}
            suppressHydrationWarning
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your perspective..."
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          suppressHydrationWarning
          className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-lg text-sm hover:bg-stone-800 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-stone-500 text-sm">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-stone-200 text-stone-500 text-sm">
            No comments yet. Be the first to share your thoughts on this story.
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 text-sm">{c.authorName}</span>
                <span className="text-xs text-stone-400">
                  {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-stone-700 text-sm font-serif leading-relaxed">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
