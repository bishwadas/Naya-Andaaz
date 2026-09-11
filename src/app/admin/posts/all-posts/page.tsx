'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { PostsManager } from '@/components/admin/PostsManager';
import { Post, Category, User } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';

function AllPostsContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPostsData = async () => {
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        fetch('/api/posts?paginate=true').then((r) => parseApiResponse<any>(r)).catch(() => ({ posts: [] })),
        fetch('/api/categories').then((r) => parseApiResponse<any>(r)).catch(() => []),
        fetch('/api/users').then((r) => parseApiResponse<any>(r)).catch(() => []),
      ]);

      setPosts(Array.isArray(pRes) ? pRes : pRes?.posts || []);
      setCategories(Array.isArray(cRes) ? cRes : []);
      setUsers(Array.isArray(uRes) ? uRes : []);
    } catch (err) {
      console.error('Failed to load posts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#EC008C]" />
        <span className="text-xs font-mono">Loading articles database...</span>
      </div>
    );
  }

  return (
    <PostsManager
      initialPosts={posts}
      categories={categories}
      users={users}
      initialMode="all"
      onPostsUpdated={fetchPostsData}
    />
  );
}

export default function AdminAllPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#EC008C]" />
          <span className="text-xs font-mono">Loading posts manager...</span>
        </div>
      }
    >
      <AllPostsContent />
    </Suspense>
  );
}
