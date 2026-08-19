'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Check
} from 'lucide-react';
import { Page, PageStatus } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface PagesManagerProps {
  initialPages?: Page[];
  initialMode?: 'all' | 'add';
  onPagesUpdated: () => void;
}

export const PagesManager: React.FC<PagesManagerProps> = ({
  initialPages = [],
  initialMode = 'all',
  onPagesUpdated,
}) => {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [viewMode, setViewMode] = useState<'all' | 'edit'>(initialMode === 'add' ? 'edit' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PageStatus>('published');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await parseApiResponse<any>(res);
      setPages(Array.isArray(data) ? data : data.pages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContent('');
    setStatus('published');
    setSeoTitle('');
    setMetaDescription('');
    setFeaturedImage('');
    setErrorMsg('');
    setSuccessMsg('');
    setViewMode('edit');
  };

  const startEdit = (page: Page) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content || '');
    setStatus(page.status);
    setSeoTitle(page.seoTitle || '');
    setMetaDescription(page.metaDescription || '');
    setFeaturedImage(page.featuredImage || '');
    setErrorMsg('');
    setSuccessMsg('');
    setViewMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMsg('Title and slug are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingPage ? `/api/pages/${editingPage.id}` : '/api/pages';
      const method = editingPage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          status,
          seoTitle,
          metaDescription,
          featuredImage,
        }),
      });

      await parseApiResponse<any>(res);

      setSuccessMsg(editingPage ? 'Page updated successfully!' : 'Page created successfully!');
      fetchPages();
      onPagesUpdated();
      setTimeout(() => setViewMode('all'), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this static page?')) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      fetchPages();
      onPagesUpdated();
    } catch (err: any) {
      alert(err.message || 'Delete error');
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'all' ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> All Static Pages ({pages.length})
          </button>
          <button
            onClick={startCreate}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'edit' && !editingPage ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add New Page
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Table view */}
      {viewMode === 'all' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-xs uppercase font-mono border-b border-stone-800">
                <tr>
                  <th className="p-4">Page Title & Slug</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-stone-500 text-xs">
                      {loading ? 'Loading pages...' : 'No static pages found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-stone-850/50 transition">
                      <td className="p-4">
                        <div className="font-serif font-bold text-white cursor-pointer hover:text-amber-400" onClick={() => startEdit(page)}>
                          {page.title}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500">/{page.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          page.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                        }`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-500 font-mono">
                        {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => startEdit(page)}
                          className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 rounded text-stone-300 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white rounded text-stone-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <h3 className="font-serif font-bold text-white text-lg">
              {editingPage ? 'Edit Static Page' : 'Create Static Page'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Page
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Page Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingPage) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Content (Markdown / HTML)</label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PageStatus)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="trash">Trash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Featured Image URL</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
