'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Layers,
  ExternalLink,
  CornerDownRight,
  ChevronRight,
  FolderTree,
  Link as LinkIcon
} from 'lucide-react';
import { Category, Menu, MenuItem } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { getCategoryUrl } from '@/lib/categories';

interface NavigationManagerProps {
  categories: Category[];
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({ categories }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'primary' | 'footer' | 'mobile'>('primary');

  // Add Custom Link form states
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemTarget, setItemTarget] = useState<'_self' | '_blank'>('_self');
  const [itemParentId, setItemParentId] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit item states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editTarget, setEditTarget] = useState<'_self' | '_blank'>('_self');
  const [editParentId, setEditParentId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Notification states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMenus();
  }, []);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await parseApiResponse<any>(res);
      setMenus(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentMenu = useMemo(() => {
    return (
      menus.find((m) => m.location === selectedLocation) || {
        id: `menu_${selectedLocation}`,
        name: `${selectedLocation} menu`,
        location: selectedLocation,
        items: [],
        createdAt: '',
        updatedAt: '',
      }
    );
  }, [menus, selectedLocation]);

  const menuItemsList = useMemo(() => {
    return currentMenu.items || [];
  }, [currentMenu]);

  // Set of category slugs already in current menu for fast check & visual status
  const existingCategorySlugs = useMemo(() => {
    const set = new Set<string>();
    for (const item of menuItemsList) {
      if (item.categorySlug) {
        set.add(item.categorySlug.toLowerCase().trim());
      }
    }
    return set;
  }, [menuItemsList]);

  // Handle adding a category
  const handleAddCategoryItem = async (cat: Category) => {
    setErrorMsg('');
    setSuccessMsg('');

    const targetUrl = getCategoryUrl(cat, categories);
    const catSlug = cat.slug.toLowerCase().trim();

    // Frontend Duplicate Check
    if (existingCategorySlugs.has(catSlug)) {
      setErrorMsg('This category is already added to the menu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/menus/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          menuId: currentMenu.id,
          label: cat.name,
          url: targetUrl,
          categorySlug: cat.slug,
          target: '_self',
        }),
      });

      const responseData = await parseApiResponse<any>(res);
      setSuccessMsg(`Added "${cat.name}" to ${selectedLocation} navigation menu.`);
      await fetchMenus();
    } catch (err: any) {
      console.error('Error adding category item:', err);
      setErrorMsg(err.message || 'Unable to add this category to the menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a custom link
  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanLabel = itemLabel.trim();
    const cleanUrl = itemUrl.trim();
    if (!cleanLabel || !cleanUrl) {
      setErrorMsg('Please provide both link text and target URL.');
      return;
    }

    // Frontend duplicate check for custom links
    const isDuplicate = menuItemsList.some(
      (item) =>
        item.url.trim().toLowerCase() === cleanUrl.toLowerCase() &&
        (item.parentId || '') === (itemParentId || '') &&
        item.label.trim().toLowerCase() === cleanLabel.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg('This item is already added to the menu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/menus/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          menuId: currentMenu.id,
          label: cleanLabel,
          url: cleanUrl,
          target: itemTarget,
          parentId: itemParentId ? itemParentId : null,
          categorySlug: selectedCategorySlug || undefined,
        }),
      });

      await parseApiResponse<any>(res);
      setSuccessMsg(`Added "${cleanLabel}" to ${selectedLocation} navigation menu.`);
      setItemLabel('');
      setItemUrl('');
      setItemTarget('_self');
      setItemParentId('');
      setSelectedCategorySlug('');
      await fetchMenus();
    } catch (err: any) {
      console.error('Error adding custom link:', err);
      setErrorMsg(err.message || 'Unable to add this menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/menus/items/${itemId}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      setSuccessMsg(`Removed "${itemTitle}" from menu.`);
      if (editingItemId === itemId) {
        setEditingItemId(null);
      }
      await fetchMenus();
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      setErrorMsg(err.message || 'Unable to delete menu item. Please try again.');
    }
  };

  // Start editing an item
  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
    setEditTarget((item.target as '_self' | '_blank') || '_self');
    setEditParentId(item.parentId || '');
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditLabel('');
    setEditUrl('');
    setEditTarget('_self');
    setEditParentId('');
  };

  // Save edit
  const handleSaveEdit = async (itemId: string) => {
    if (!editLabel.trim() || !editUrl.trim()) {
      setErrorMsg('Label and URL cannot be empty.');
      return;
    }

    // Cannot make an item its own parent
    if (editParentId === itemId) {
      setErrorMsg('An item cannot be its own parent.');
      return;
    }

    setIsUpdating(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/menus/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel.trim(),
          url: editUrl.trim(),
          target: editTarget,
          parentId: editParentId ? editParentId : null,
        }),
      });

      await parseApiResponse<any>(res);
      setSuccessMsg('Menu item updated successfully.');
      setEditingItemId(null);
      await fetchMenus();
    } catch (err: any) {
      console.error('Error updating item:', err);
      setErrorMsg(err.message || 'Unable to update menu item.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Move item Up/Down in ordering
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const items = [...menuItemsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap items in array
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // Re-assign 0-based orders
    const reordered = items.map((it, idx) => ({
      ...it,
      order: idx,
    }));

    // Optimistic UI update
    setMenus((prev) =>
      prev.map((m) => (m.location === selectedLocation ? { ...m, items: reordered } : m))
    );

    try {
      const res = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentMenu.id,
          location: selectedLocation,
          items: reordered,
        }),
      });
      await parseApiResponse<any>(res);
    } catch (err: any) {
      console.error('Error reordering items:', err);
      setErrorMsg('Failed to save menu ordering.');
      fetchMenus(); // Revert on failure
    }
  };

  // Build organized hierarchy list: Root items followed by their children
  const hierarchicalItems = useMemo(() => {
    const rootItems = menuItemsList.filter((item) => !item.parentId);
    const childMap = new Map<string, MenuItem[]>();

    menuItemsList.forEach((item) => {
      if (item.parentId) {
        const existing = childMap.get(item.parentId) || [];
        existing.push(item);
        childMap.set(item.parentId, existing);
      }
    });

    const result: Array<{ item: MenuItem; isChild: boolean; parentLabel?: string; originalIndex: number }> = [];

    // If no parent relationships exist, return original flat list with indices
    if (childMap.size === 0) {
      return menuItemsList.map((item, idx): { item: MenuItem; isChild: boolean; parentLabel?: string; originalIndex: number } => ({
        item,
        isChild: false,
        parentLabel: undefined,
        originalIndex: idx,
      }));
    }

    // Traverse root items and place their children immediately below
    rootItems.forEach((root) => {
      const rootIndex = menuItemsList.findIndex((it) => it.id === root.id);
      result.push({
        item: root,
        isChild: false,
        originalIndex: rootIndex,
      });

      const children = childMap.get(root.id) || [];
      children.forEach((child) => {
        const childIndex = menuItemsList.findIndex((it) => it.id === child.id);
        result.push({
          item: child,
          isChild: true,
          parentLabel: root.label,
          originalIndex: childIndex,
        });
      });
    });

    // Also include any orphan items whose parentId doesn't exist
    const renderedIds = new Set(result.map((r) => r.item.id));
    menuItemsList.forEach((item, idx) => {
      if (!renderedIds.has(item.id)) {
        result.push({
          item,
          isChild: false,
          originalIndex: idx,
        });
      }
    });

    return result;
  }, [menuItemsList]);

  // Possible parent items for parent selector (exclude editing item itself)
  const potentialParents = useMemo(() => {
    return menuItemsList.filter((it) => !it.parentId && it.id !== editingItemId);
  }, [menuItemsList, editingItemId]);

  return (
    <div className="space-y-6">
      {/* Location Selector Bar */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <MenuIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base leading-tight">Navigation Builder</h3>
            <p className="text-[11px] text-stone-400">Configure header, footer, and mobile navigation menus</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['primary', 'footer', 'mobile'] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setSelectedLocation(loc);
                handleCancelEdit();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition ${
                selectedLocation === loc
                  ? 'bg-amber-400 text-stone-950 shadow-sm font-semibold'
                  : 'bg-stone-950 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {loc} Menu
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg('')}
            className="text-rose-400 hover:text-rose-200 p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-400 hover:text-emerald-200 p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add items (Categories & Custom Link) */}
        <div className="space-y-6">
          {/* Quick Categories adder */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-3 flex items-center justify-between">
              <span>Add Categories to Menu</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {categories.length === 0 ? (
                <p className="text-stone-500 text-xs py-2">No categories available.</p>
              ) : (
                categories.map((cat) => {
                  const isAdded = existingCategorySlugs.has(cat.slug.toLowerCase().trim());
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-950 border border-stone-800 text-xs hover:border-stone-700 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-stone-300 font-medium truncate">{cat.name}</span>
                        {cat.parentId && (
                          <span className="text-[10px] text-stone-500 font-mono bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 flex-shrink-0">
                            sub
                          </span>
                        )}
                      </div>

                      {isAdded ? (
                        <span className="px-2 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono text-[10px] font-bold rounded flex items-center gap-1 flex-shrink-0">
                          <Check className="w-3 h-3" /> In Menu
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddCategoryItem(cat)}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-200 font-bold rounded text-[11px] transition flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Custom Link adder */}
          <form
            onSubmit={handleAddCustomItem}
            className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-3 flex items-center justify-between">
              <span>Add Custom Link</span>
              <LinkIcon className="w-4 h-4 text-amber-400" />
            </h4>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Link Text</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Reports or Contact Us"
                value={itemLabel}
                onChange={(e) => setItemLabel(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Target URL</label>
              <input
                type="text"
                required
                placeholder="/page/contact-us or https://..."
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Open In</label>
                <select
                  value={itemTarget}
                  onChange={(e) => setItemTarget(e.target.value as '_self' | '_blank')}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Parent Item</label>
                <select
                  value={itemParentId}
                  onChange={(e) => setItemParentId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="">None (Top Level)</option>
                  {potentialParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !itemLabel.trim() || !itemUrl.trim()}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add to Menu
            </button>
          </form>
        </div>

        {/* Right: Menu Structure View */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-serif font-bold text-white text-base capitalize flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-400" />
                {selectedLocation} Menu Hierarchy
              </h4>
              <p className="text-xs text-stone-400">Order and structure visible to public visitors</p>
            </div>
            <div className="text-xs font-mono text-stone-500">
              {menuItemsList.length} {menuItemsList.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="space-y-2.5">
            {menuItemsList.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-xs bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <MenuIcon className="w-8 h-8 mx-auto text-stone-600 opacity-50" />
                <p className="font-medium text-stone-400">No items currently assigned to this navigation menu.</p>
                <p className="text-stone-600">Use the panels on the left to add categories or custom links.</p>
              </div>
            ) : (
              hierarchicalItems.map(({ item, isChild, parentLabel, originalIndex }) => {
                const isEditing = editingItemId === item.id;

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-stone-950 border border-amber-400/50 rounded-xl space-y-3 shadow-lg transition"
                    >
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <span className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5" /> Edit Menu Item
                        </span>
                        <button
                          onClick={handleCancelEdit}
                          className="text-stone-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                            Target URL
                          </label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                            Open In
                          </label>
                          <select
                            value={editTarget}
                            onChange={(e) => setEditTarget(e.target.value as '_self' | '_blank')}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
                          >
                            <option value="_self">Same Tab (_self)</option>
                            <option value="_blank">New Tab (_blank)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                            Parent Item
                          </label>
                          <select
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
                          >
                            <option value="">None (Top Level)</option>
                            {potentialParents.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition ${
                      isChild ? 'ml-6 border-l-2 border-l-amber-400/60 bg-stone-950/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      {isChild ? (
                        <div className="w-5 h-5 flex items-center justify-center text-amber-400/80 flex-shrink-0">
                          <CornerDownRight className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 text-[10px] flex items-center justify-center font-mono font-bold flex-shrink-0">
                          {originalIndex + 1}
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-white text-xs truncate">
                            {item.label}
                          </span>
                          {item.categorySlug && (
                            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex-shrink-0">
                              category
                            </span>
                          )}
                          {item.target === '_blank' && (
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 flex items-center gap-0.5 flex-shrink-0">
                              <ExternalLink className="w-2.5 h-2.5" /> new tab
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 truncate flex items-center gap-1">
                          {isChild && parentLabel && (
                            <span className="text-stone-600">under {parentLabel} • </span>
                          )}
                          <span>{item.url}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Reordering buttons */}
                      <button
                        onClick={() => handleMove(originalIndex, 'up')}
                        disabled={originalIndex === 0}
                        className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition disabled:opacity-20 disabled:hover:bg-stone-900 disabled:hover:text-stone-400"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(originalIndex, 'down')}
                        disabled={originalIndex === menuItemsList.length - 1}
                        className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition disabled:opacity-20 disabled:hover:bg-stone-900 disabled:hover:text-stone-400"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-stone-400 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.label)}
                        className="p-1.5 bg-stone-900 hover:bg-rose-600 hover:text-white text-stone-400 rounded-lg transition"
                        title="Remove from menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
