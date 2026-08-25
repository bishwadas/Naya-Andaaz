'use client';

import React, { useState, useEffect } from 'react';
import { CommentsManager } from '@/components/admin/CommentsManager';
import { Comment } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const cRes = await fetch('/api/comments').then((r) => parseApiResponse<any>(r));
      setComments(Array.isArray(cRes) ? cRes : cRes?.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
        <span className="text-xs font-mono">Loading moderation queue...</span>
      </div>
    );
  }

  return (
    <CommentsManager
      initialComments={comments}
      onCommentsUpdated={fetchComments}
    />
  );
}
