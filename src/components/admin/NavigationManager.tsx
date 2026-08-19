'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  MoveUp,
  MoveDown,
  Layers
} from 'lucide-react';
import { Category, Menu, MenuItem } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface NavigationManagerProps {
  categories: Category[];
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({ categories }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'primary' | 'footer' | 'mobile'>('primary');

  // Form states
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await parseApiResponse<any>(res);
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoryItem = async (cat: Category) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/menus/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          label: cat.name,
          url: `/${cat.slug}`,
          categorySlug: cat.slug,
          order: 99,
        }),
      });
      await parseApiResponse<any>(res);
      setSuccessMsg(`Added "${cat.name}" to ${selectedLocation} navigation menu`);
      fetchMenus();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemLabel.trim() || !itemUrl.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/menus/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          label: itemLabel,
          url: itemUrl,
          categorySlug: selectedCategorySlug || undefined,
          order: 99,
        }),
      });
      await parseApiResponse<any>(res);
      setSuccessMsg(`Added item to menu`);
      setItemLabel('');
      setItemUrl('');
      setSelectedCategorySlug('');
      fetchMenus();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/menus/items/${itemId}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      fetchMenus();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const currentMenu = menus.find((m) => m.location === selectedLocation) || {
    id: 'default',
    name: `${selectedLocation} menu`,
    location: selectedLocation,
    items: [],
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className="space-y-6">
      {/* Location Selector Bar */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MenuIcon className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-white text-base">Navigation Builder</h3>
        </div>

        <div className="flex items-center gap-2">
          {(['primary', 'footer', 'mobile'] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono transition ${
                selectedLocation === loc ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
              }`}
            >
              {loc} Menu
            </button>
          ))}
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add items (Categories & Custom Link) */}
        <div className="space-y-6">
          {/* Quick Categories adder */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2 flex items-center justify-between">
              <span>Add Categories to Menu</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-1.5 px-2.5 rounded bg-stone-950 border border-stone-800 text-xs">
                  <span className="text-stone-300 font-medium">{cat.name}</span>
                  <button
                    onClick={() => handleAddCategoryItem(cat)}
                    disabled={isSubmitting}
                    className="px-2 py-1 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-300 font-bold rounded text-[10px] transition"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Link adder */}
          <form onSubmit={handleAddCustomItem} className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2">
              Add Custom Link
            </h4>
            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Link Text</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Reports"
                value={itemLabel}
                onChange={(e) => setItemLabel(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Target URL</label>
              <input
                type="text"
                required
                placeholder="/page/contact or https://..."
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition"
            >
              Add to Menu
            </button>
          </form>
        </div>

        {/* Right: Menu Structure View */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-white text-base capitalize">
                {selectedLocation} Menu Hierarchy
              </h4>
              <p className="text-xs text-stone-400">Order and items currently visible to visitors</p>
            </div>
          </div>

          <div className="space-y-2">
            {!currentMenu.items || currentMenu.items.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs bg-stone-950 rounded-lg border border-stone-800">
                No items currently assigned to this navigation location. Use the panel on the left to add items.
              </div>
            ) : (
              currentMenu.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-stone-950 border border-stone-800 rounded-lg hover:border-stone-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 text-[10px] flex items-center justify-center font-mono font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-serif font-bold text-white text-xs">{item.label}</div>
                      <div className="text-[11px] font-mono text-stone-500">{item.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 bg-stone-900 hover:bg-rose-600 hover:text-white text-stone-400 rounded transition"
                      title="Remove from menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
