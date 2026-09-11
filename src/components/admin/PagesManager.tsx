'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye,
  ExternalLink,
  Calendar,
  Layers,
  Database,
  FileText
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
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
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
      const fetched = Array.isArray(data) ? data : data.pages || [];
      setPages(fetched);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      setErrorMsg(err.message || 'Failed to fetch pages from database');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    window.location.href = '/admin/pages/new';
  };

  const startEdit = (page: Page) => {
    window.location.href = `/admin/pages/${page.id}/edit`;
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`Are you sure you want to move "${pageTitle}" to trash?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      setSuccessMsg(`Page "${pageTitle}" removed successfully.`);
      fetchPages();
      onPagesUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete error');
    }
  };

  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchTerm, statusFilter]);

  const publishedCount = useMemo(() => pages.filter((p) => p.status === 'published').length, [pages]);
  const draftCount = useMemo(() => pages.filter((p) => p.status === 'draft').length, [pages]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-lg text-xs font-bold bg-pink-600 text-white shadow-xs flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> All Static Pages ({pages.length})
            </span>
            <button
              id="admin-pages-add-new-btn"
              type="button"
              onClick={startCreate}
              className="px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Page
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-stone-400 pl-2 border-l border-stone-200">
            <span className="text-emerald-700 font-semibold">{publishedCount} published</span>
            <span>•</span>
            <span className="text-stone-500 font-semibold">{draftCount} draft</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="admin-pages-search-input"
              type="text"
              placeholder="Search pages by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-pink-600 focus:bg-white transition"
            />
          </div>

          <select
            id="admin-pages-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-pink-600 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="trash">Trash</option>
          </select>

          <button
            id="admin-pages-refresh-btn"
            onClick={fetchPages}
            className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition"
            title="Refresh Pages Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW: All Pages Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase font-mono border-b border-stone-200">
              <tr>
                <th className="p-4">Page Title & Slug</th>
                <th className="p-4">Route / Path</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <FileCode className="w-8 h-8 text-stone-300 mx-auto" />
                      <div className="font-serif font-bold text-stone-800 text-base">
                        {loading ? 'Loading Pages...' : 'No Static Pages Found'}
                      </div>
                      <p className="text-xs text-stone-500">
                        {searchTerm
                          ? `No pages matched "${searchTerm}". Try another search keyword.`
                          : 'No static CMS pages are currently present. Click "Add New Page" to publish one.'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={startCreate}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create First Page
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => {
                  const isPrivacy = page.slug === 'privacy-policy' || page.slug === 'privacy';
                  const publicUrl = isPrivacy ? '/privacy-policy' : `/page/${page.slug}`;

                  return (
                    <tr key={page.id} className="hover:bg-stone-50/80 transition group">
                      <td className="p-4 max-w-md">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              isPrivacy
                                ? 'bg-pink-50 text-pink-600 border-pink-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div
                              onClick={() => startEdit(page)}
                              className="font-serif font-bold text-stone-900 group-hover:text-pink-600 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{page.title}</span>
                              {isPrivacy && (
                                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 border border-pink-200">
                                  System Page
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-stone-400 truncate mt-0.5">
                              /{page.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-pink-600 transition bg-stone-100 hover:bg-pink-50 px-2 py-1 rounded"
                        >
                          <span>{publicUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="p-4 text-xs font-medium text-stone-600">
                        {page.authorName || 'Editorial Staff'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            page.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : page.status === 'draft'
                              ? 'bg-stone-100 text-stone-600 border-stone-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-stone-500 font-mono">
                        {new Date(page.updatedAt || page.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            id={`admin-edit-page-${page.id}`}
                            onClick={() => startEdit(page)}
                            className="p-1.5 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                            title="Edit Page in Dedicated Editor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`admin-delete-page-${page.id}`}
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
