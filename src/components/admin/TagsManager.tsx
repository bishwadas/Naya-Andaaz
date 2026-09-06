'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Tag as TagIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Tag as TagType } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface TagsManagerProps {
  initialTags?: TagType[];
  onTagsUpdated?: () => void;
}

type SortField = 'name' | 'slug' | 'description' | 'posts' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const TagsManager: React.FC<TagsManagerProps> = ({
  initialTags = [],
  onTagsUpdated,
}) => {
  // Main Data States
  const [tags, setTags] = useState<TagType[]>(initialTags);
  const [loading, setLoading] = useState(false);

  // Form States (Add / Edit)
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selection & Bulk Actions
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'none' | 'delete'>('none');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single Delete Modal
  const [deletingTag, setDeletingTag] = useState<TagType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 3500);
    },
    []
  );

  // Fetch Tags from Server
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags', { cache: 'no-store' });
      const data = await parseApiResponse<TagType[]>(res);
      if (Array.isArray(data)) {
        setTags(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch tags:', err);
      showToast(err.message || 'Failed to load tags', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Initial Fetch if initialTags empty or to refresh
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Helper to slugify text
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Name change handler: auto-populates slug unless user manually edited slug
  const handleNameChange = (val: string) => {
    setTagName(val);
    setFormError(null);
    if (!isSlugManuallyEdited && !editingTag) {
      setTagSlug(slugify(val));
    }
  };

  // Slug change handler
  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setTagSlug(slugify(val));
    setFormError(null);
  };

  // Reset form to clean "Add New Tag" state
  const resetForm = () => {
    setEditingTag(null);
    setTagName('');
    setTagSlug('');
    setTagDescription('');
    setIsSlugManuallyEdited(false);
    setFormError(null);
  };

  // Start editing a tag
  const handleStartEdit = (tag: TagType) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setTagDescription(tag.description || '');
    setIsSlugManuallyEdited(true);
    setFormError(null);

    // Scroll to form smoothly on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Form Submission (Add or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = tagName.trim().replace(/^#+/, '').trim();
    const cleanSlug = tagSlug.trim().replace(/^#+/, '').trim();

    if (!cleanName) {
      setFormError('Please enter a tag name');
      return;
    }

    if (!cleanSlug) {
      setFormError('Please enter a valid tag slug');
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingTag) {
        // UPDATE EXISTING TAG
        const res = await fetch(`/api/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            slug: cleanSlug,
            description: tagDescription.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update tag');
        }

        showToast(`Tag "${cleanName}" updated successfully`);
        resetForm();
        await fetchTags();
        onTagsUpdated?.();
      } else {
        // CREATE NEW TAG
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            slug: cleanSlug,
            description: tagDescription.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create tag');
        }

        showToast(`Tag "${cleanName}" created successfully`);
        resetForm();
        await fetchTags();
        onTagsUpdated?.();
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the tag');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Single Delete
  const handleDeleteTag = async () => {
    if (!deletingTag) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/tags/${deletingTag.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete tag');
      }

      showToast(`Tag "${deletingTag.name}" deleted successfully`);
      setSelectedTagIds((prev) => prev.filter((id) => id !== deletingTag.id));
      setDeletingTag(null);
      await fetchTags();
      onTagsUpdated?.();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete tag', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedTagIds.length === 0) return;
    setIsBulkDeleting(true);

    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTagIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete selected tags');
      }

      showToast(`${selectedTagIds.length} tags deleted successfully`);
      setSelectedTagIds([]);
      setBulkAction('none');
      setBulkModalOpen(false);
      await fetchTags();
      onTagsUpdated?.();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete tags', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Filtered & Sorted Tags
  const processedTags = useMemo(() => {
    let result = [...tags];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'slug') {
        comparison = a.slug.localeCompare(b.slug);
      } else if (sortField === 'description') {
        const descA = a.description || '';
        const descB = b.description || '';
        comparison = descA.localeCompare(descB);
      } else if (sortField === 'posts') {
        const countA = a.postCount ?? 0;
        const countB = b.postCount ?? 0;
        comparison = countA - countB;
      } else if (sortField === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tags, searchQuery, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = processedTags.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTags = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return processedTags.slice(start, start + pageSize);
  }, [processedTags, safeCurrentPage, pageSize]);

  // Adjust page if current page exceeds total pages due to filter
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Toggle sorting on column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Selection handlers
  const isAllCurrentPageSelected =
    paginatedTags.length > 0 &&
    paginatedTags.every((t) => selectedTagIds.includes(t.id));

  const handleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = paginatedTags.map((t) => t.id);
      setSelectedTagIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedTags.map((t) => t.id);
      setSelectedTagIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          id="tags-toast-notification"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-900 shadow-emerald-500/10'
              : toast.type === 'error'
              ? 'bg-white border-rose-200 text-rose-900 shadow-rose-500/10'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          <span className="font-medium text-stone-800">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header / Breadcrumb / Actions Bar */}
      <div className="space-y-3">
        {/* Breadcrumb matching Image 2 */}
        <nav
          id="tags-breadcrumb"
          className="flex items-center gap-2 text-xs text-stone-500 font-medium"
        >
          <Link
            href="/admin/dashboard"
            className="hover:text-stone-900 transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-stone-300">&gt;</span>
          <Link
            href="/admin/posts/all-posts"
            className="hover:text-stone-900 transition-colors"
          >
            Posts
          </Link>
          <span className="text-stone-300">&gt;</span>
          <span className="text-stone-800 font-semibold">Tags</span>
        </nav>

        {/* Title and Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1
              id="tags-page-title"
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
            >
              Tags
            </h1>
            <span
              id="tags-total-count-badge"
              className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100/80 text-[#EC008C]"
            >
              {tags.length}
            </span>
          </div>

          {/* Search & Bulk Action Controls matching Image 2 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="tags-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tags..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bulk Actions Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                id="tags-bulk-action-select"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C] transition cursor-pointer"
              >
                <option value="none">Bulk actions</option>
                <option value="delete">Delete</option>
              </select>

              <button
                id="tags-bulk-apply-btn"
                type="button"
                disabled={bulkAction === 'none' || selectedTagIds.length === 0}
                onClick={() => {
                  if (bulkAction === 'delete' && selectedTagIds.length > 0) {
                    setBulkModalOpen(true);
                  }
                }}
                className="px-4 py-2 border border-pink-200 text-[#EC008C] hover:bg-pink-50 hover:border-[#EC008C] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-pink-200 text-sm font-semibold rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add / Edit Tag Card */}
        <div
          id="add-tag-card"
          className="lg:col-span-4 xl:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
        >
          {/* Card Header matching Image 2 */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                  editingTag ? 'bg-amber-500' : 'bg-[#EC008C]'
                }`}
              >
                {editingTag ? (
                  <Pencil className="w-3 h-3" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
              <h2 className="text-base font-bold text-stone-900">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
            </div>

            {editingTag && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div
              id="tag-form-error"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* Tag Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="tag-name-input"
                className="block text-xs font-semibold text-stone-800"
              >
                Tag Name <span className="text-[#EC008C]">*</span>
              </label>
              <input
                id="tag-name-input"
                type="text"
                value={tagName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Bollywood"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C] transition"
              />
              <p className="text-[11px] text-stone-400 leading-relaxed">
                The name is how it appears on your site.
              </p>
            </div>

            {/* Tag Slug */}
            <div className="space-y-1.5">
              <label
                htmlFor="tag-slug-input"
                className="block text-xs font-semibold text-stone-800"
              >
                Tag Slug <span className="text-[#EC008C]">*</span>
              </label>
              <input
                id="tag-slug-input"
                type="text"
                value={tagSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. bollywood"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 font-mono placeholder:text-stone-400 focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C] transition"
              />
              <p className="text-[11px] text-stone-400 leading-relaxed">
                The &ldquo;slug&rdquo; is the URL-friendly version of the name.
                Usually lowercase and contains only letters, numbers, and hyphens.
              </p>
            </div>

            {/* Tag Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="tag-description-input"
                className="block text-xs font-semibold text-stone-800"
              >
                Description
              </label>
              <textarea
                id="tag-description-input"
                rows={4}
                value={tagDescription}
                onChange={(e) => setTagDescription(e.target.value)}
                placeholder="Briefly describe what this tag is about..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#EC008C] focus:ring-1 focus:ring-[#EC008C] transition resize-none"
              />
              <p className="text-[11px] text-stone-400 leading-relaxed">
                The description is not prominent by default, but some themes may show it.
              </p>
            </div>

            {/* Submit Button matching Image 2 */}
            <button
              id="tag-submit-btn"
              type="submit"
              disabled={formSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#EC008C] hover:bg-[#d6007f] active:scale-[0.99] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{editingTag ? 'Updating Tag...' : 'Adding Tag...'}</span>
                </>
              ) : (
                <>
                  <TagIcon className="w-4 h-4 text-white" />
                  <span>{editingTag ? 'Update Tag' : 'Add New Tag'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Tags List Card */}
        <div
          id="tags-table-card"
          className="lg:col-span-8 xl:col-span-8 bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden"
        >
          {/* Active selection banner if tags are checked */}
          {selectedTagIds.length > 0 && (
            <div className="bg-pink-50 border-b border-pink-100 px-5 py-2.5 flex items-center justify-between text-xs text-[#EC008C]">
              <span className="font-semibold">
                {selectedTagIds.length} tag{selectedTagIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedTagIds([])}
                className="text-stone-500 hover:text-stone-800 underline font-medium"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Table Container with horizontal overflow */}
          <div className="overflow-x-auto min-h-[300px]">
            <table id="tags-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  {/* Checkbox */}
                  <th className="w-10 px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllCurrentPage}
                      className="text-stone-400 hover:text-stone-600 focus:outline-none"
                      title={
                        isAllCurrentPageSelected
                          ? 'Deselect all on this page'
                          : 'Select all on this page'
                      }
                    >
                      {isAllCurrentPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#EC008C]" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300" />
                      )}
                    </button>
                  </th>

                  {/* Name */}
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 transition group"
                    >
                      <span>Name</span>
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#EC008C]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#EC008C]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                      )}
                    </button>
                  </th>

                  {/* Slug */}
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('slug')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 transition group"
                    >
                      <span>Slug</span>
                      {sortField === 'slug' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#EC008C]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#EC008C]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                      )}
                    </button>
                  </th>

                  {/* Description */}
                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort('description')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 transition group"
                    >
                      <span>Description</span>
                      {sortField === 'description' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#EC008C]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#EC008C]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                      )}
                    </button>
                  </th>

                  {/* Posts */}
                  <th className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('posts')}
                      className="inline-flex items-center gap-1 hover:text-stone-900 transition group"
                    >
                      <span>Posts</span>
                      {sortField === 'posts' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#EC008C]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#EC008C]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                      )}
                    </button>
                  </th>

                  {/* Actions */}
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-stone-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#EC008C]" />
                        <span className="text-xs font-medium">Loading tags...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTags.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TagIcon className="w-8 h-8 text-stone-300 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-stone-700">
                          {searchQuery ? 'No tags found matching search' : 'No tags available'}
                        </p>
                        <p className="text-xs text-stone-400">
                          {searchQuery
                            ? 'Try searching with another keyword or clear the search'
                            : 'Create your first tag using the form on the left'}
                        </p>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-xs text-[#EC008C] font-semibold hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <tr
                        key={tag.id}
                        className={`hover:bg-stone-50/70 transition-colors group ${
                          isSelected ? 'bg-pink-50/30' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectTag(tag.id)}
                            className="text-stone-400 hover:text-stone-600 focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#EC008C]" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />
                            )}
                          </button>
                        </td>

                        {/* Name (Clickable link with pink tag icon) */}
                        <td className="px-4 py-3.5 font-medium">
                          <a
                            href={`/tags/${tag.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#EC008C] hover:text-[#d6007f] font-semibold hover:underline cursor-pointer group/link"
                            title={`Open public tag archive: /tags/${tag.slug}`}
                          >
                            <TagIcon className="w-3.5 h-3.5 text-[#EC008C] shrink-0 group-hover/link:rotate-12 transition-transform" />
                            <span>{tag.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-pink-300 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </a>
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3.5 text-stone-600 text-xs font-mono">
                          {tag.slug}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5 text-stone-500 text-xs max-w-xs truncate">
                          {tag.description || <span className="text-stone-300">&mdash;</span>}
                        </td>

                        {/* Posts Count Badge matching Image 2 */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-[#EC008C]">
                            {tag.postCount ?? 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(tag)}
                              title="Edit tag"
                              className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-100 text-stone-600 transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTag(tag)}
                              title="Delete tag"
                              className="p-1.5 rounded-lg border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Table Footer: Item counts & Pagination matching Image 2 */}
          <div
            id="tags-table-footer"
            className="border-t border-stone-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/40 text-xs text-stone-500"
          >
            {/* Left: Showing X to Y of Z */}
            <div>
              {totalItems === 0 ? (
                <span>Showing 0 tags</span>
              ) : (
                <span>
                  Showing{' '}
                  <strong className="font-semibold text-stone-700">
                    {(safeCurrentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="font-semibold text-stone-700">
                    {Math.min(safeCurrentPage * pageSize, totalItems)}
                  </strong>{' '}
                  of{' '}
                  <strong className="font-semibold text-stone-700">
                    {totalItems}
                  </strong>{' '}
                  tags
                </span>
              )}
            </div>

            {/* Right: Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-stone-200 flex items-center justify-center transition"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and window around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {hasGap && (
                          <span className="w-8 h-8 flex items-center justify-center text-stone-400">
                            &hellip;
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            safeCurrentPage === page
                              ? 'bg-[#EC008C] text-white shadow-xs'
                              : 'bg-white border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-white text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-stone-200 flex items-center justify-center transition"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Delete Confirmation Modal */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Delete Tag &ldquo;{deletingTag.name}&rdquo;?
                </h3>
                <p className="text-xs text-stone-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
              Posts associated with this tag will <strong>not</strong> be deleted,
              but the tag taxonomy relationship will be removed from them.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTag(null)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTag}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Delete {selectedTagIds.length} Selected Tags?
                </h3>
                <p className="text-xs text-stone-500">
                  This bulk action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
              Are you sure you want to remove the {selectedTagIds.length} selected
              tags? Associated posts will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => {
                  setBulkModalOpen(false);
                  setBulkAction('none');
                }}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2"
              >
                {isBulkDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete {selectedTagIds.length} Tags</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
