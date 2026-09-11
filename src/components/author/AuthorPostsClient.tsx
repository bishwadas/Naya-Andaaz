'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sparkles,
  Tag as TagIcon,
  Check,
  Image as ImageIcon,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Copy,
  FolderTree,
  AlertTriangle,
  Clock,
  Flame,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
} from 'lucide-react';
import { Post, Category, Tag, User, PostStatus } from '@/types';
import { api, parseApiResponse } from '@/lib/api';

export interface AuthorPostsClientProps {
  initialPosts?: Post[];
  categories?: Category[];
  users?: User[];
  initialMode?: 'all' | 'add' | 'tags';
  onPostsUpdated?: () => void;
}

export const AuthorPostsClient: React.FC<AuthorPostsClientProps> = ({
  initialPosts = [],
  categories = [],
  users = [],
  initialMode = 'all',
  onPostsUpdated,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode (all posts vs tags manager)
  const [viewMode, setViewMode] = useState<'all' | 'tags'>(
    initialMode === 'tags' ? 'tags' : 'all'
  );

  // Status Filter Tab (all | published | draft | scheduled | pending | trash)
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams?.get('status') || 'all'
  );

  // Search input & debounced search term
  const [searchInput, setSearchInput] = useState<string>(
    searchParams?.get('search') || ''
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams?.get('search') || ''
  );

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams?.get('categoryId') || 'all'
  );

  // Date filter: all | today | yesterday | this_week | this_month | previous_month | custom
  const [dateFilter, setDateFilter] = useState<string>(
    searchParams?.get('dateFilter') || 'all'
  );
  const [dateFrom, setDateFrom] = useState<string>(
    searchParams?.get('dateFrom') || ''
  );
  const [dateTo, setDateTo] = useState<string>(
    searchParams?.get('dateTo') || ''
  );

  // Sorting
  const [sortBy, setSortBy] = useState<string>(
    searchParams?.get('sortBy') || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams?.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  // Pagination
  const [page, setPage] = useState<number>(
    parseInt(searchParams?.get('page') || '1', 10) || 1
  );
  const [limit, setLimit] = useState<number>(
    parseInt(searchParams?.get('limit') || '20', 10) || 20
  );

  // Data & Counts
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [total, setTotal] = useState<number>(initialPosts.length);
  const [totalPages, setTotalPages] = useState<number>(
    Math.max(1, Math.ceil(initialPosts.length / limit))
  );
  const [counts, setCounts] = useState<{
    all: number;
    published: number;
    draft: number;
    scheduled: number;
    pending: number;
    trash: number;
  }>({
    all: initialPosts.filter((p) => !p.isTrashed && p.status !== 'trash').length,
    published: initialPosts.filter((p) => p.status === 'published' && !p.isTrashed).length,
    draft: initialPosts.filter((p) => p.status === 'draft' && !p.isTrashed).length,
    scheduled: initialPosts.filter((p) => p.status === 'scheduled' && !p.isTrashed).length,
    pending: initialPosts.filter((p) => p.status === 'pending' && !p.isTrashed).length,
    trash: initialPosts.filter((p) => p.isTrashed || p.status === 'trash').length,
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals & Feedback
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'primary';
    action: () => Promise<void>;
  } | null>(null);

  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    postIds: string[];
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [copiedSlugId, setCopiedSlugId] = useState<string | null>(null);

  // Tag Manager internal state
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [tagLoading, setTagLoading] = useState(false);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch paginated posts from server
  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      const params: Record<string, any> = {
        paginate: 'true',
        status: statusFilter,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      if (dateFilter !== 'all') {
        params.dateFilter = dateFilter;
        if (dateFilter === 'custom') {
          if (dateFrom) params.dateFrom = dateFrom;
          if (dateTo) params.dateTo = dateTo;
        }
      }

      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.set(k, String(v));
        }
      });

      const res = await fetch(`/api/author/posts?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to load articles');

      const data = await res.json();

      if (data && Array.isArray(data.posts)) {
        setPosts(data.posts);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.counts) {
          setCounts(data.counts);
        }
      } else if (Array.isArray(data)) {
        setPosts(data);
        setTotal(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      }
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      showToast(err.message || 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, page, limit, sortBy, sortOrder, searchTerm, categoryFilter, dateFilter, dateFrom, dateTo, showToast]);

  // Fetch tags for tag mode
  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const res = await fetch('/api/tags');
      const data = await parseApiResponse<Tag[]>(res);
      setTagsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'tags') {
      fetchTags();
    } else {
      fetchPosts();
    }
  }, [fetchPosts, fetchTags, viewMode]);

  // Master checkbox indeterminate state
  useEffect(() => {
    if (!masterCheckboxRef.current) return;
    const currentPostIds = posts.map((p) => p.id);
    const selectedCurrentCount = currentPostIds.filter((id) => selectedIds.has(id)).length;

    if (selectedCurrentCount === 0) {
      masterCheckboxRef.current.checked = false;
      masterCheckboxRef.current.indeterminate = false;
    } else if (selectedCurrentCount === currentPostIds.length && currentPostIds.length > 0) {
      masterCheckboxRef.current.checked = true;
      masterCheckboxRef.current.indeterminate = false;
    } else {
      masterCheckboxRef.current.checked = false;
      masterCheckboxRef.current.indeterminate = true;
    }
  }, [selectedIds, posts]);

  // Selection handlers
  const toggleSelectAllCurrent = () => {
    const currentPostIds = posts.map((p) => p.id);
    const allSelected = currentPostIds.every((id) => selectedIds.has(id));

    const next = new Set(selectedIds);
    if (allSelected) {
      currentPostIds.forEach((id) => next.delete(id));
    } else {
      currentPostIds.forEach((id) => next.add(id));
    }
    setSelectedIds(next);
  };

  const toggleSelectPost = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Quick Copy slug
  const handleCopySlug = (post: Post) => {
    const fullUrl = `${window.location.origin}/${post.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlugId(post.id);
    showToast(`Copied article URL to clipboard: /${post.slug}`);
    setTimeout(() => {
      setCopiedSlugId((prev) => (prev === post.id ? null : prev));
    }, 2000);
  };

  // Single Actions
  const handleDuplicatePost = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.duplicatePost(id);
      showToast(`Article duplicated as draft: "${res.title}"`, 'success');
      await fetchPosts();
      if (onPostsUpdated) onPostsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate article', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleTrash = (post: Post) => {
    setConfirmModal({
      open: true,
      title: 'Move Article to Trash?',
      description: `Are you sure you want to move "${post.title}" to the trash? You can restore it anytime from the Trash tab.`,
      confirmLabel: 'Move to Trash',
      variant: 'danger',
      action: async () => {
        try {
          await api.bulkPosts({ action: 'trash', postIds: [post.id] });
          showToast(`Moved "${post.title}" to Trash`, 'info');
          setSelectedIds((prev) => {
            const n = new Set(prev);
            n.delete(post.id);
            return n;
          });
          await fetchPosts();
          if (onPostsUpdated) onPostsUpdated();
        } catch (err: any) {
          showToast(err.message || 'Failed to move article to trash', 'error');
        }
      },
    });
  };

  const handleSingleRestore = async (post: Post) => {
    try {
      setLoading(true);
      await api.bulkPosts({ action: 'restore', postIds: [post.id] });
      showToast(`Restored "${post.title}" from Trash`, 'success');
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(post.id);
        return n;
      });
      await fetchPosts();
      if (onPostsUpdated) onPostsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to restore article', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSinglePermanentDelete = (post: Post) => {
    setConfirmModal({
      open: true,
      title: 'Permanently Delete Article?',
      description: `This will completely erase "${post.title}" and its associated media revisions. This action is irreversible.`,
      confirmLabel: 'Permanently Delete',
      variant: 'danger',
      action: async () => {
        try {
          await api.bulkPosts({ action: 'delete', postIds: [post.id] });
          showToast(`Permanently deleted "${post.title}"`, 'info');
          setSelectedIds((prev) => {
            const n = new Set(prev);
            n.delete(post.id);
            return n;
          });
          await fetchPosts();
          if (onPostsUpdated) onPostsUpdated();
        } catch (err: any) {
          showToast(err.message || 'Failed to delete article', 'error');
        }
      },
    });
  };

  // Bulk Actions
  const handleApplyBulkAction = async () => {
    if (selectedIds.size === 0) {
      showToast('Please select at least one article first.', 'info');
      return;
    }
    if (!bulkAction) {
      showToast('Please choose an action to apply from the dropdown.', 'info');
      return;
    }

    const postIds = Array.from(selectedIds);

    if (bulkAction === 'trash') {
      setConfirmModal({
        open: true,
        title: `Move ${postIds.length} Article(s) to Trash?`,
        description: `Are you sure you want to move ${postIds.length} selected article(s) to the Trash? You can restore them anytime.`,
        confirmLabel: `Move ${postIds.length} to Trash`,
        variant: 'danger',
        action: async () => {
          setBulkActionLoading(true);
          try {
            const res = await api.bulkPosts({ action: 'trash', postIds });
            showToast(res.message || `Moved ${postIds.length} articles to trash`, 'success');
            setSelectedIds(new Set());
            setBulkAction('');
            await fetchPosts();
            if (onPostsUpdated) onPostsUpdated();
          } catch (err: any) {
            showToast(err.message || 'Failed to apply bulk trash action', 'error');
          } finally {
            setBulkActionLoading(false);
          }
        },
      });
      return;
    }

    if (bulkAction === 'delete') {
      setConfirmModal({
        open: true,
        title: `Permanently Delete ${postIds.length} Article(s)?`,
        description: `This will permanently delete ${postIds.length} selected article(s). This action cannot be undone.`,
        confirmLabel: `Permanently Delete ${postIds.length} Articles`,
        variant: 'danger',
        action: async () => {
          setBulkActionLoading(true);
          try {
            const res = await api.bulkPosts({ action: 'delete', postIds });
            showToast(res.message || `Permanently deleted ${postIds.length} articles`, 'info');
            setSelectedIds(new Set());
            setBulkAction('');
            await fetchPosts();
            if (onPostsUpdated) onPostsUpdated();
          } catch (err: any) {
            showToast(err.message || 'Failed to permanently delete articles', 'error');
          } finally {
            setBulkActionLoading(false);
          }
        },
      });
      return;
    }

    if (bulkAction === 'category') {
      setCategoryModal({ open: true, postIds });
      return;
    }

    // Direct bulk actions: restore, publish, draft, pending, duplicate
    setBulkActionLoading(true);
    try {
      const res = await api.bulkPosts({
        action: bulkAction as any,
        postIds,
      });
      showToast(res.message || `Bulk operation completed for ${postIds.length} article(s)`, 'success');
      setSelectedIds(new Set());
      setBulkAction('');
      await fetchPosts();
      if (onPostsUpdated) onPostsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to perform bulk action', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleApplyBulkCategory = async () => {
    if (!categoryModal || !bulkCategoryTarget) {
      showToast('Please choose a target category.', 'info');
      return;
    }
    setBulkActionLoading(true);
    try {
      const res = await api.bulkPosts({
        action: 'category',
        postIds: categoryModal.postIds,
        categoryId: bulkCategoryTarget,
      });
      showToast(res.message || `Updated category for ${categoryModal.postIds.length} articles`, 'success');
      setCategoryModal(null);
      setBulkCategoryTarget('');
      setSelectedIds(new Set());
      setBulkAction('');
      await fetchPosts();
      if (onPostsUpdated) onPostsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update categories', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Sorting helper
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'title' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  // Status Tab helper
  const handleStatusTabChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setSelectedIds(new Set());
    setPage(1);
  };

  // Category Tree builder for dropdown
  const hierarchicalCategories = useMemo(() => {
    const parents = categories.filter((c) => !c.parentId);
    const childMap = new Map<string, Category[]>();

    categories.forEach((c) => {
      if (c.parentId) {
        const existing = childMap.get(c.parentId) || [];
        existing.push(c);
        childMap.set(c.parentId, existing);
      }
    });

    const result: { category: Category; depth: number }[] = [];

    const traverse = (cat: Category, depth: number) => {
      result.push({ category: cat, depth });
      const children = childMap.get(cat.id) || [];
      children.forEach((child) => traverse(child, depth + 1));
    };

    parents.forEach((p) => traverse(p, 0));

    // Also include any orphan subcategories if parent was deleted or not found
    const accountedIds = new Set(result.map((r) => r.category.id));
    categories.forEach((c) => {
      if (!accountedIds.has(c.id)) {
        result.push({ category: c, depth: 0 });
      }
    });

    return result;
  }, [categories]);

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== '' ||
    categoryFilter !== 'all' ||
    dateFilter !== 'all' ||
    statusFilter !== 'all';

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setCategoryFilter('all');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setPage(1);
  };

  const getStatusBadge = (status: PostStatus, isTrashed = false) => {
    if (isTrashed || status === 'trash') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Trash
        </span>
      );
    }
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3 text-indigo-500" />
            Scheduled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all transform translate-y-0 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toast.type === 'info'
              ? 'bg-[#171717] text-white border-stone-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : toast.type === 'info' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#171717] text-base">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-[#6B625C] mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E0DA]">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6B625C] hover:text-[#171717] hover:bg-[#F3F0EC] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const act = confirmModal.action;
                  setConfirmModal(null);
                  await act();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white shadow-xs transition ${
                  confirmModal.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#EC008C] hover:bg-pink-600'
                }`}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Category Change Modal */}
      {categoryModal && categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
              <h3 className="font-serif font-bold text-[#171717] text-base">
                Assign Category to {categoryModal.postIds.length} Article(s)
              </h3>
              <button
                onClick={() => setCategoryModal(null)}
                className="text-[#6B625C] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6B625C]">
                Select Destination Category
              </label>
              <select
                value={bulkCategoryTarget}
                onChange={(e) => setBulkCategoryTarget(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              >
                <option value="">-- Choose Category --</option>
                {hierarchicalCategories.map(({ category, depth }) => (
                  <option key={category.id} value={category.id}>
                    {depth > 0 ? `${'\u00A0'.repeat(depth * 3)}↳ ` : ''}
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E0DA]">
              <button
                type="button"
                onClick={() => setCategoryModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#6B625C] hover:text-[#171717] hover:bg-[#F3F0EC] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bulkCategoryTarget || bulkActionLoading}
                onClick={handleApplyBulkCategory}
                className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#EC008C] hover:bg-pink-600 disabled:opacity-50 transition shadow-xs"
              >
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: All Posts */}
      {viewMode === 'all' && (
        <div className="space-y-5">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                  All Posts
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-[#F3F0EC] text-[#6B625C] border border-[#E5E0DA]">
                  {counts.all} Total
                </span>
              </div>
              <p className="text-xs text-[#6B625C] mt-1">
                Editorial post management, bulk controls, classification, and lifecycle review.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  router.push('/author/posts/new');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#EC008C] hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Post</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('tags')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDD6D0] hover:border-[#EC008C] hover:text-[#EC008C] text-[#6B625C] text-xs font-medium rounded-xl transition shadow-xs"
              >
                <TagIcon className="w-3.5 h-3.5 text-[#EC008C]" />
                <span>Tags</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/author/posts/categories')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDD6D0] hover:border-[#EC008C] hover:text-[#EC008C] text-[#6B625C] text-xs font-medium rounded-xl transition shadow-xs"
              >
                <FolderTree className="w-3.5 h-3.5 text-stone-600" />
                <span>Categories</span>
              </button>

              <button
                type="button"
                onClick={() => fetchPosts()}
                disabled={isRefreshing}
                title="Refresh articles data"
                className="p-2 bg-white border border-[#DDD6D0] hover:border-stone-400 text-[#6B625C] rounded-xl transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#EC008C]' : ''}`} />
              </button>
            </div>
          </div>

          {/* WordPress-Style Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E5E0DA]">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'published', label: 'Published', count: counts.published },
              { id: 'draft', label: 'Drafts', count: counts.draft },
              { id: 'scheduled', label: 'Scheduled', count: counts.scheduled },
              { id: 'pending', label: 'Pending Review', count: counts.pending },
              { id: 'trash', label: 'Trash', count: counts.trash },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'text-[#6B625C] hover:text-[#171717] hover:bg-[#F3F0EC]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-stone-700 text-stone-200'
                        : 'bg-[#E5E0DA] text-[#6B625C]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Search Bar */}
              <div className="lg:col-span-4 relative">
                <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search title, excerpt, keyword, slug..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#DDD6D0] rounded-xl text-xs text-[#171717] placeholder:text-[#8C827A] focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchTerm('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="lg:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 bg-white border border-[#DDD6D0] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                >
                  <option value="all">All Categories</option>
                  {hierarchicalCategories.map(({ category, depth }) => (
                    <option key={category.id} value={category.id}>
                      {depth > 0 ? `${'\u00A0'.repeat(depth * 3)}↳ ` : ''}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="lg:col-span-3">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full py-2 px-3 bg-white border border-[#DDD6D0] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week (Last 7 Days)</option>
                  <option value="this_month">This Month</option>
                  <option value="previous_month">Previous Month</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>

              {/* Items per page selector */}
              <div className="lg:col-span-2 flex items-center justify-end gap-2">
                <span className="text-[11px] font-mono text-[#6B625C] whitespace-nowrap">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="py-1.5 px-2 bg-white border border-[#DDD6D0] rounded-lg text-xs font-mono text-[#171717] focus:outline-none focus:border-[#EC008C]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Picker (Shown when dateFilter === 'custom') */}
            {dateFilter === 'custom' && (
              <div className="pt-2 border-t border-[#E5E0DA] flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B625C] font-mono">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="py-1.5 px-2.5 bg-white border border-[#DDD6D0] rounded-lg text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B625C] font-mono">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="py-1.5 px-2.5 bg-white border border-[#DDD6D0] rounded-lg text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    fetchPosts();
                  }}
                  className="px-3 py-1.5 bg-[#171717] hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition"
                >
                  Apply Range
                </button>
              </div>
            )}

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-[#E5E0DA] flex items-center flex-wrap gap-2 text-xs">
                <span className="text-[#6B625C] font-mono text-[11px]">Active Filters:</span>

                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F3F0EC] text-[#171717] border border-[#E5E0DA]">
                    Status: <strong className="capitalize">{statusFilter}</strong>
                    <button
                      type="button"
                      onClick={() => handleStatusTabChange('all')}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F3F0EC] text-[#171717] border border-[#E5E0DA]">
                    Search: <strong>&ldquo;{searchTerm}&rdquo;</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setSearchTerm('');
                      }}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F3F0EC] text-[#171717] border border-[#E5E0DA]">
                    Category:{' '}
                    <strong>
                      {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F3F0EC] text-[#171717] border border-[#E5E0DA]">
                    Date: <strong className="capitalize">{dateFilter.replace('_', ' ')}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilter('all');
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-[#EC008C] hover:underline ml-1"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Bulk Actions Header / Floating Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  ref={masterCheckboxRef}
                  type="checkbox"
                  onChange={toggleSelectAllCurrent}
                  className="w-4 h-4 rounded-sm text-[#EC008C] focus:ring-[#EC008C] border-[#DDD6D0]"
                />
                <span className="text-xs font-medium text-[#171717]">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} of ${posts.length} on this page selected`
                    : 'Select All on page'}
                </span>
              </label>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[11px] text-[#6B625C] hover:text-rose-600 font-mono underline transition"
                >
                  Deselect all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={selectedIds.size === 0 || bulkActionLoading}
                className="py-1.5 px-3 bg-white border border-[#DDD6D0] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#EC008C] disabled:opacity-50 disabled:bg-[#F3F0EC]"
              >
                <option value="">-- Bulk Actions --</option>
                {statusFilter !== 'trash' ? (
                  <>
                    <option value="trash">Move to Trash</option>
                    <option value="publish">Set Status: Published</option>
                    <option value="draft">Set Status: Draft</option>
                    <option value="pending">Set Status: Pending Review</option>
                    <option value="category">Change Category...</option>
                    <option value="duplicate">Duplicate Selected</option>
                  </>
                ) : (
                  <>
                    <option value="restore">Restore from Trash</option>
                    <option value="delete">Permanently Delete</option>
                  </>
                )}
              </select>

              <button
                type="button"
                disabled={selectedIds.size === 0 || !bulkAction || bulkActionLoading}
                onClick={handleApplyBulkAction}
                className="px-3.5 py-1.5 bg-[#171717] hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {bulkActionLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Posts Table / Card List */}
          <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl shadow-xs overflow-hidden">
            {loading ? (
              /* Skeletons */
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3.5 border-b border-[#E5E0DA] last:border-0 animate-pulse"
                  >
                    <div className="w-4 h-4 bg-[#E5E0DA] rounded-sm shrink-0" />
                    <div className="w-14 h-10 bg-[#E5E0DA] rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="w-3/5 h-4 bg-[#E5E0DA] rounded-md" />
                      <div className="w-2/5 h-3 bg-[#E5E0DA] rounded-md" />
                    </div>
                    <div className="w-20 h-6 bg-[#E5E0DA] rounded-full shrink-0" />
                    <div className="w-24 h-4 bg-[#E5E0DA] rounded-md shrink-0" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              /* Contextual Empty State */
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F0EC] border border-[#E5E0DA] flex items-center justify-center mx-auto text-[#8C827A]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#171717]">
                    {searchTerm !== '' || categoryFilter !== 'all' || dateFilter !== 'all'
                      ? 'No articles match your active filters'
                      : statusFilter === 'trash'
                      ? 'Trash is empty'
                      : statusFilter === 'draft'
                      ? 'No drafts found'
                      : statusFilter === 'scheduled'
                      ? 'No scheduled articles found'
                      : statusFilter === 'pending'
                      ? 'No pending articles found'
                      : 'No articles in database'}
                  </h3>
                  <p className="text-xs text-[#6B625C] max-w-sm mx-auto mt-1">
                    {hasActiveFilters
                      ? 'Try clearing your search query, adjusting date bounds, or selecting a different category desk.'
                      : 'Create your first post or import content into the CMS to start publishing.'}
                  </p>
                </div>
                <div>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-[#171717] hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Clear All Filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push('/author/posts/new')}
                      className="px-4 py-2 bg-[#EC008C] hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      + Add New Article
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Responsive Table View (Desktop & Tablet) */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E0DA] bg-[#FBF8F5] text-[#6B625C] font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 pl-4 pr-2 w-10">
                        <input
                          type="checkbox"
                          checked={
                            posts.length > 0 &&
                            posts.every((p) => selectedIds.has(p.id))
                          }
                          onChange={toggleSelectAllCurrent}
                          className="w-4 h-4 rounded-sm text-[#EC008C] focus:ring-[#EC008C] border-[#DDD6D0]"
                        />
                      </th>
                      <th className="py-3.5 px-2 w-16 text-center">Media</th>
                      <th
                        className="py-3.5 px-3 cursor-pointer select-none hover:text-[#171717]"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Article Title & Slug</span>
                          {sortBy === 'title' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#EC008C]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#EC008C]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-[#8C827A] opacity-60" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-3 hidden md:table-cell">Category</th>
                      
                      <th
                        className="py-3.5 px-3 cursor-pointer select-none hover:text-[#171717]"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          {sortBy === 'status' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#EC008C]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#EC008C]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-[#8C827A] opacity-60" />
                          )}
                        </div>
                      </th>
                      <th
                        className="py-3.5 px-3 cursor-pointer select-none hover:text-[#171717] hidden sm:table-cell"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Date</span>
                          {sortBy === 'createdAt' || sortBy === 'publishedAt' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#EC008C]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#EC008C]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-[#8C827A] opacity-60" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0DA]">
                    {posts.map((post) => {
                      const isSelected = selectedIds.has(post.id);
                      const postDate = new Date(
                        post.publishedAt || post.createdAt
                      );
                      const isPostTrashed = post.isTrashed || post.status === 'trash';

                      return (
                        <tr
                          key={post.id}
                          className={`group transition-colors ${
                            isSelected
                              ? 'bg-pink-50/40'
                              : 'hover:bg-[#FBF8F5]'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 pl-4 pr-2 align-top pt-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPost(post.id)}
                              className="w-4 h-4 rounded-sm text-[#EC008C] focus:ring-[#EC008C] border-[#DDD6D0]"
                            />
                          </td>

                          {/* Media Thumbnail */}
                          <td className="py-3 px-2 align-top pt-3.5 text-center">
                            <div className="w-14 h-10 rounded-lg overflow-hidden border border-[#E5E0DA] bg-[#F3F0EC] relative group-hover:border-[#DDD6D0] shrink-0 mx-auto">
                              {post.featuredImage ? (
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title & Slug & Quick Links */}
                          <td className="py-3 px-3 align-top space-y-1.5">
                            <div>
                              <button
                                type="button"
                                onClick={() => router.push(`/author/posts/${post.id}/edit`)}
                                className="font-serif font-bold text-sm text-[#171717] hover:text-[#EC008C] transition text-left leading-snug line-clamp-2"
                              >
                                {post.title}
                              </button>

                              <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                <span className="font-mono text-[10px] text-[#8C827A] truncate max-w-[200px]">
                                  /{post.slug}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleCopySlug(post)}
                                  title="Copy URL"
                                  className="text-stone-400 hover:text-[#EC008C] p-0.5"
                                >
                                  {copiedSlugId === post.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>

                                {post.isFeatured && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    Featured
                                  </span>
                                )}

                                {post.isTrending && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                                    <Flame className="w-2.5 h-2.5 text-rose-500" />
                                    Trending
                                  </span>
                                )}

                                {post.isEditorPick && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                                    Editor&apos;s Pick
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quick Action Links (Visible on Hover/Focus) */}
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#6B625C]">
                              <button
                                type="button"
                                onClick={() => router.push(`/author/posts/${post.id}/edit`)}
                                className="text-[#EC008C] hover:underline font-semibold"
                              >
                                Edit
                              </button>
                              <span>•</span>
                              <a
                                href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#171717] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => handleDuplicatePost(post.id)}
                                className="hover:text-[#171717] hover:underline"
                              >
                                Duplicate
                              </button>
                              <span>•</span>
                              {isPostTrashed ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSingleRestore(post)}
                                    className="text-emerald-600 hover:underline font-semibold"
                                  >
                                    Restore
                                  </button>
                                  <span>•</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSinglePermanentDelete(post)}
                                    className="text-rose-600 hover:underline font-semibold"
                                  >
                                    Delete Permanently
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSingleTrash(post)}
                                  className="text-rose-600 hover:underline"
                                >
                                  Trash
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 align-top pt-4 hidden md:table-cell">
                            {post.category ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3F0EC] text-[#171717] border border-[#E5E0DA]">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: post.category.color || '#E11D48',
                                    }}
                                  />
                                  {post.category.name}
                                </span>
                                {post.subCategory && (
                                  <div className="text-[10px] text-[#8C827A] font-mono pl-3">
                                    ↳ {post.subCategory.name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#8C827A] font-mono text-[11px]">—</span>
                            )}
                          </td>

                          {/* Author */}
                          <td className="py-3 px-3 align-top pt-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#E5E0DA] text-[#6B625C] flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                                {post.author?.avatar ? (
                                  <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (post.author?.name || 'E')[0].toUpperCase()
                                )}
                              </div>
                              <span className="text-xs text-[#171717] font-medium truncate max-w-[100px]">
                                {post.author?.name || 'Staff'}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 align-top pt-4 whitespace-nowrap">
                            {getStatusBadge(post.status, isPostTrashed)}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 align-top pt-4 hidden sm:table-cell whitespace-nowrap text-[#6B625C]">
                            <div className="text-[11px] font-mono">
                              {postDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-[#8C827A] font-mono flex items-center gap-1 mt-0.5">
                              <Eye className="w-2.5 h-2.5" />
                              <span>{post.views || 0} views</span>
                            </div>
                          </td>

                          {/* Actions button */}
                          <td className="py-3 pr-4 pl-2 align-top pt-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => router.push(`/author/posts/${post.id}/edit`)}
                                title="Edit post"
                                className="p-1.5 text-[#6B625C] hover:text-[#EC008C] hover:bg-white rounded-lg border border-transparent hover:border-[#E5E0DA] transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={`/${post.subCategory?.slug || 'uncategorized'}/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Preview article"
                                className="p-1.5 text-[#6B625C] hover:text-[#171717] hover:bg-white rounded-lg border border-transparent hover:border-[#E5E0DA] transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#E5E0DA] bg-[#FBF8F5] text-xs text-[#6B625C]">
              <div className="font-mono text-[11px]">
                Showing{' '}
                <strong className="text-[#171717]">
                  {total === 0 ? 0 : (page - 1) * limit + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-[#171717]">
                  {Math.min(page * limit, total)}
                </strong>{' '}
                of <strong className="text-[#171717]">{total}</strong> articles
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(1)}
                  className="p-1.5 rounded-lg border border-[#DDD6D0] bg-white hover:bg-[#F3F0EC] disabled:opacity-40 disabled:hover:bg-white transition"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#DDD6D0] bg-white hover:bg-[#F3F0EC] disabled:opacity-40 disabled:hover:bg-white transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="px-2.5 py-1 text-xs font-mono font-bold text-[#171717]">
                  Page {page} of {totalPages}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#DDD6D0] bg-white hover:bg-[#F3F0EC] disabled:opacity-40 disabled:hover:bg-white transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(totalPages)}
                  className="p-1.5 rounded-lg border border-[#DDD6D0] bg-white hover:bg-[#F3F0EC] disabled:opacity-40 disabled:hover:bg-white transition"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Tags Manager (Preserved for full compatibility with /author/posts/tags) */}
      {viewMode === 'tags' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-5 shadow-xs">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#171717]">
                Article Taxonomy Tags
              </h2>
              <p className="text-xs text-[#6B625C] mt-1">
                Classification keywords and topics index used across all editorial posts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className="px-3.5 py-2 bg-white border border-[#DDD6D0] hover:border-[#171717] text-[#171717] text-xs font-bold rounded-xl transition shadow-xs"
            >
              Back to Posts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Tag Form */}
            <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-sm text-[#171717] border-b border-[#E5E0DA] pb-2">
                Add New Tag
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => {
                      setNewTagName(e.target.value);
                      setNewTagSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                    Tag Slug
                  </label>
                  <input
                    type="text"
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    placeholder="e.g. artificial-intelligence"
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#EC008C] font-mono focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <button
                  type="button"
                  disabled={tagLoading || !newTagName.trim()}
                  onClick={async () => {
                    setTagLoading(true);
                    try {
                      const res = await fetch('/api/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newTagName, slug: newTagSlug }),
                      });
                      if (res.ok) {
                        setNewTagName('');
                        setNewTagSlug('');
                        showToast('Keyword tag created successfully', 'success');
                        fetchTags();
                      } else {
                        const err = await res.json();
                        showToast(err.error || 'Failed to create tag', 'error');
                      }
                    } catch (err: any) {
                      showToast(err.message || 'Tag creation error', 'error');
                    } finally {
                      setTagLoading(false);
                    }
                  }}
                  className="w-full py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-bold rounded-lg text-xs transition shadow-xs disabled:opacity-50"
                >
                  {tagLoading ? 'Adding...' : 'Add Tag'}
                </button>
              </div>
            </div>

            {/* Tags Index List */}
            <div className="md:col-span-2 bg-[#FFFDFC] border border-[#E5E0DA] rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#171717] border-b border-[#E5E0DA] pb-2">
                Existing Taxonomy Tags ({tagsList.length})
              </h3>
              {tagsLoading ? (
                <div className="py-8 text-center text-stone-400 text-xs font-mono">
                  Loading tags...
                </div>
              ) : tagsList.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  No tags registered yet. Create tags on the left.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag) => (
                    <a
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F0EC] hover:bg-pink-50 border border-[#E5E0DA] hover:border-[#EC008C] rounded-lg text-xs text-[#171717] hover:text-[#EC008C] transition group cursor-pointer"
                      title={`View public tag archive: /tags/${tag.slug}`}
                    >
                      <TagIcon className="w-3 h-3 text-[#EC008C]" />
                      <span className="font-medium">{tag.name}</span>
                      <span className="font-mono text-[10px] text-[#8C827A] group-hover:text-pink-600">
                        ({tag.slug})
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 text-stone-400 group-hover:text-[#EC008C] ml-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
