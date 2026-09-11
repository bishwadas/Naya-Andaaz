'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  FileText,
  FileCode,
  FolderTree,
  Tag as TagIcon,
  Users as UsersIcon,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '@/lib/api';

export interface TrashedItem {
  id: string;
  type: 'post' | 'page' | 'category' | 'tag' | 'user';
  title: string;
  slug?: string;
  authorName?: string;
  categoryName?: string;
  parentName?: string;
  deletedAt: string;
  status?: string;
}

export const TrashManager: React.FC = () => {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTrash();
      setItems(data || []);
    } catch (err: any) {
      console.error('Failed to fetch trash:', err);
      setError(err.message || 'Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (type: string, id: string, title: string) => {
    try {
      setActionLoadingId(id);
      await api.restoreTrashItem(type, id);
      setSuccessMessage(`Successfully restored "${title}"`);
      await fetchTrash();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to restore item: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDelete = async (type: string, id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setActionLoadingId(id);
      await api.permanentDeleteTrashItem(type, id);
      setSuccessMessage(`Permanently deleted "${title}"`);
      await fetchTrash();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to permanently delete item: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestoreAll = async () => {
    if (!confirm('Are you sure you want to restore all items in the Trash?')) return;
    try {
      setLoading(true);
      await api.restoreAllTrash();
      setSuccessMessage('All trashed items have been restored.');
      await fetchTrash();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to restore all items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !confirm(
        'WARNING: This will permanently delete all items in the Trash. This action is irreversible. Proceed?'
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.emptyTrash();
      setSuccessMessage('Trash has been emptied.');
      await fetchTrash();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to empty trash: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.authorName && item.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.slug && item.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'page':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'category':
        return <FolderTree className="w-4 h-4 text-amber-400" />;
      case 'tag':
        return <TagIcon className="w-4 h-4 text-blue-400" />;
      case 'user':
        return <UsersIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-stone-100 font-serif">Trash Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-sm text-stone-400 mt-1">
            Deleted records are stored here. You can restore them or delete them permanently.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrash}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {items.length > 0 && (
            <>
              <button
                onClick={handleRestoreAll}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-xs font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore All
              </button>
              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Empty Trash
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search trashed items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'post', 'page', 'category', 'tag', 'user'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-rose-500 text-white font-semibold shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {type === 'all' ? 'All Types' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / List */}
      <div className="bg-stone-900/40 border border-stone-800/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
            <p className="text-sm">Loading trash inventory...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 flex flex-col items-center justify-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-stone-300 font-medium text-base">Trash is clean</h3>
              <p className="text-xs text-stone-500 mt-1">
                No deleted items found matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-900/60 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  <th className="py-3 px-4 font-medium">Item Title / Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Category / Parent</th>
                  <th className="py-3 px-4 font-medium">Author</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Deleted Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-sm text-stone-300">
                {filteredItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-stone-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-100 flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="truncate max-w-xs">{item.title}</span>
                      </div>
                      {item.slug && (
                        <span className="text-xs text-stone-500 font-mono pl-6">/{item.slug}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-stone-800 text-stone-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-xs">
                      {item.categoryName || item.parentName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-xs">
                      {item.authorName || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-stone-800 text-stone-400 border border-stone-700">
                          {item.status}
                        </span>
                      ) : (
                        <span className="text-stone-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(item.deletedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(item.type, item.id, item.title)}
                          disabled={actionLoadingId === item.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition"
                          title="Restore Item"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.type, item.id, item.title)}
                          disabled={actionLoadingId === item.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-medium transition"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
