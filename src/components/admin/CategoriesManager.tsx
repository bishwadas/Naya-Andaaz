'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  RefreshCw,
  Layers,
  FileText,
  Palette,
  Globe,
  Info,
} from 'lucide-react';
import { Category } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface CategoriesManagerProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
}

const PRESET_COLORS = [
  '#E11D48', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#0EA5E9', // Sky
];

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  onCategoriesUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    color: '#E11D48',
    image: '',
    seoTitle: '',
    metaDescription: '',
    order: 0,
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Status & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Build tree structure for tabular presentation
  const hierarchicalCategories = useMemo(() => {
    const parentMap = new Map<string | null, Category[]>();
    categories.forEach((cat) => {
      const pId = cat.parentId || null;
      if (!parentMap.has(pId)) parentMap.set(pId, []);
      parentMap.get(pId)!.push(cat);
    });

    const result: { category: Category; level: number; parentName?: string }[] = [];

    const traverse = (parentId: string | null, level: number) => {
      const children = parentMap.get(parentId) || [];
      // Sort children by order then name
      children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

      children.forEach((child) => {
        const parent = categories.find((c) => c.id === child.parentId);
        result.push({
          category: child,
          level,
          parentName: parent?.name,
        });
        traverse(child.id, level + 1);
      });
    };

    traverse(null, 0);

    // If any orphaned categories exist (e.g. invalid parentId), append them
    const addedIds = new Set(result.map((r) => r.category.id));
    categories.forEach((cat) => {
      if (!addedIds.has(cat.id)) {
        result.push({ category: cat, level: 0 });
      }
    });

    return result;
  }, [categories]);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return hierarchicalCategories;

    const term = searchTerm.toLowerCase().trim();
    return hierarchicalCategories.filter(({ category, parentName }) => {
      return (
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term)) ||
        (parentName && parentName.toLowerCase().includes(term))
      );
    });
  }, [hierarchicalCategories, searchTerm]);

  // Calculate invalid parent IDs for circular dependency prevention
  const getInvalidParentIds = (catId: string): Set<string> => {
    const invalidSet = new Set<string>([catId]);
    const findDescendants = (parentId: string) => {
      categories.forEach((c) => {
        if (c.parentId === parentId && !invalidSet.has(c.id)) {
          invalidSet.add(c.id);
          findDescendants(c.id);
        }
      });
    };
    findDescendants(catId);
    return invalidSet;
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      color: '#E11D48',
      image: '',
      seoTitle: '',
      metaDescription: '',
      order: 0,
    });
    setIsSlugManuallyEdited(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      parentId: category.parentId || '',
      color: category.color || '#E11D48',
      image: category.image || '',
      seoTitle: category.seoTitle || '',
      metaDescription: category.metaDescription || '',
      order: category.order ?? 0,
    });
    setIsSlugManuallyEdited(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, name: newName };
      if (!isSlugManuallyEdited && !editingCategory) {
        updated.slug = newName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Category Name is required');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Category Slug is required');
      return;
    }
    if (!/^[a-z0-9-_]+$/i.test(formData.slug.trim())) {
      setFormError('Slug can only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    if (editingCategory && formData.parentId === editingCategory.id) {
      setFormError('A category cannot be its own parent.');
      return;
    }

    if (editingCategory) {
      const invalidParents = getInvalidParentIds(editingCategory.id);
      if (formData.parentId && invalidParents.has(formData.parentId)) {
        setFormError('Cannot select a descendant category as parent (circular dependency).');
        return;
      }
    }

    // Client-side pre-validation for existing category
    const cleanSlug = formData.slug.trim().toLowerCase();
    const cleanName = formData.name.trim().toLowerCase();
    const existingDuplicate = categories.find(
      (c) =>
        (!editingCategory || c.id !== editingCategory.id) &&
        (c.slug.toLowerCase() === cleanSlug || c.name.toLowerCase() === cleanName)
    );

    if (existingDuplicate) {
      setFormError(
        `A category named "${existingDuplicate.name}" with slug "${existingDuplicate.slug}" already exists.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || null,
        color: formData.color || '#E11D48',
        image: formData.image.trim() || undefined,
        seoTitle: formData.seoTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        order: Number(formData.order) || 0,
      };

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await parseApiResponse<any>(res);

      setSuccessMessage(
        editingCategory ? 'Category updated successfully!' : 'Category created successfully!'
      );
      setTimeout(() => setSuccessMessage(''), 3000);

      setIsModalOpen(false);
      onCategoriesUpdated();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      await parseApiResponse<any>(res);

      setSuccessMessage(`Category "${deletingCategory.name}" was deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);

      setDeletingCategory(null);
      onCategoriesUpdated();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const invalidParentsForCurrentEdit = editingCategory
    ? getInvalidParentIds(editingCategory.id)
    : new Set<string>();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module Overview Banner & Action Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <FolderTree className="w-4 h-4" /> Editorial Taxonomy Architecture
          </div>
          <h2 className="font-serif text-xl font-bold text-white">Categories Management</h2>
          <p className="text-xs text-stone-400 max-w-2xl">
            Structure primary news sectors, manage parent-child subcategories, customize category colors, and optimize search engine metadata.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Toolbar: Search & Total Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name, slug..."
            className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
          <span className="px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg">
            Total: <strong className="text-white">{categories.length}</strong> categories
          </span>
        </div>
      </div>

      {/* Categories Data Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-stone-400 uppercase font-mono border-b border-stone-800">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 hidden md:table-cell">Description</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-center">Posts</th>
                <th className="p-4 hidden lg:table-cell">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-500 space-y-3">
                    <FolderTree className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="text-sm font-medium text-stone-400">
                      {searchTerm ? 'No categories matching search query.' : 'No categories found.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-1 bg-stone-800 text-stone-300 rounded text-xs hover:bg-stone-700 transition"
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map(({ category, level, parentName }) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-stone-850/80 transition group ${
                      level > 0 ? 'bg-stone-950/30' : ''
                    }`}
                  >
                    {/* Category Name & Hierarchy Indentation */}
                    <td className="p-4">
                      <div
                        className="flex items-center gap-2 min-w-0"
                        style={{ paddingLeft: `${level * 20}px` }}
                      >
                        {level > 0 && (
                          <CornerDownRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: category.color || '#E11D48' }}
                        />
                        <span className="font-semibold text-white truncate group-hover:text-rose-300 transition">
                          {category.name}
                        </span>
                        {level === 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-800 text-stone-400 rounded border border-stone-700/50">
                            Sector
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="p-4 font-mono text-stone-400">/{category.slug}</td>

                    {/* Description */}
                    <td className="p-4 hidden md:table-cell text-stone-400 max-w-xs truncate">
                      {category.description || '—'}
                    </td>

                    {/* Parent Category */}
                    <td className="p-4">
                      {parentName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                          <Layers className="w-3 h-3 text-amber-400" /> {parentName}
                        </span>
                      ) : (
                        <span className="text-stone-500 italic">— Main Category</span>
                      )}
                    </td>

                    {/* Order */}
                    <td className="p-4 text-center font-mono text-stone-400 font-semibold">
                      {category.order ?? 0}
                    </td>

                    {/* Posts Count */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-stone-200 bg-stone-800 border border-stone-700 px-2 py-0.5 rounded-md text-[11px]">
                        <FileText className="w-3 h-3 text-rose-400" /> {category.postCount ?? 0}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 hidden lg:table-cell text-stone-500 font-mono text-[11px]">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeletingCategory(category);
                          }}
                          className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-rose-200 rounded-lg transition border border-rose-800/40"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-lg text-white">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-stone-300">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-200 mb-1">
                    Category Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Cinema & OTT"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-200 mb-1">
                    Slug <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="e.g. cinema-ott"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Grid 2: Parent Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-200 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData((p) => ({ ...p, parentId: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {hierarchicalCategories.map(({ category: cat, level }) => {
                      const isDisabled =
                        editingCategory &&
                        (cat.id === editingCategory.id || invalidParentsForCurrentEdit.has(cat.id));
                      const prefix = level > 0 ? `${'\u00A0\u00A0'.repeat(level - 1)}└─ ` : '';
                      return (
                        <option key={cat.id} value={cat.id} disabled={Boolean(isDisabled)}>
                          {prefix}
                          {cat.name} {isDisabled ? '(Invalid - Circular)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-200 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Accent Badge Color */}
              <div>
                <label className="block font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-400" /> Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="w-9 h-9 bg-transparent border-0 rounded cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="w-28 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white"
                  />
                  <div className="flex items-center gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, color }))}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          formData.color === color ? 'border-white scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-200 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief summary of articles published in this category..."
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-semibold text-stone-200 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* SEO Title & Meta Description */}
              <div className="pt-2 border-t border-stone-800 space-y-3">
                <div className="flex items-center gap-1.5 font-semibold text-stone-200">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> SEO & Search Meta Controls
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))}
                    placeholder="Custom HTML Title Tag for Category Page..."
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="Search engine snippet meta description..."
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">Delete Category</h3>
                <p className="text-xs text-stone-400">Confirm taxonomy removal</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deletingCategory.name}"</strong>?
            </p>

            <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1 text-[11px] text-stone-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Info className="w-3.5 h-3.5" /> Database Safety Notice
              </div>
              <ul className="list-disc list-inside space-y-0.5 pt-1">
                <li>Subcategories linked to this category will be unlinked (parent set to none).</li>
                <li>Posts associated with this primary category will be safely reassigned to a fallback category.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
