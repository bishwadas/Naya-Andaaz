'use client';

import React, { useState, useEffect } from 'react';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { Category } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditorCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const cRes = await fetch('/api/categories').then((r) => parseApiResponse<any>(r));
      setCategories(Array.isArray(cRes) ? cRes : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
        <span className="text-xs font-mono">Loading taxonomy categories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
          Categories & Taxonomy
        </h1>
        <p className="text-xs text-stone-500">
          Manage website content categories, slugs, parent hierarchies, and display orders
        </p>
      </div>

      <CategoriesManager
        categories={categories}
        onCategoriesUpdated={fetchCategories}
      />
    </div>
  );
}
