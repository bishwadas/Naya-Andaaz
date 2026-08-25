'use client';

import React, { useState, useEffect } from 'react';
import { PostsManager } from '@/components/admin/PostsManager';
import { Post, Category, User } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditorTagsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTagsData = async () => {
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        fetch('/api/posts').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/categories').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/users').then((r) => parseApiResponse<any>(r)).catch(() => []),
      ]);

      setPosts(Array.isArray(pRes) ? pRes : pRes?.posts || []);
      setCategories(Array.isArray(cRes) ? cRes : []);
      setUsers(Array.isArray(uRes) ? uRes : []);
    } catch (err) {
      console.error('Failed to load tags data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTagsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
        <span className="text-xs font-mono">Loading tags management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
          Tags Management
        </h1>
        <p className="text-xs text-stone-500">
          Create, edit, and organize topic keywords across Sereia
        </p>
      </div>

      <PostsManager
        initialPosts={posts}
        categories={categories}
        users={users}
        initialMode="tags"
        onPostsUpdated={fetchTagsData}
      />
    </div>
  );
}
