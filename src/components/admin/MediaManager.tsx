'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  FileImage,
  UploadCloud
} from 'lucide-react';
import { MediaItem } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface MediaManagerProps {
  initialMedia?: MediaItem[];
}

export const MediaManager: React.FC<MediaManagerProps> = ({ initialMedia = [] }) => {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Media Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media').then((r) => parseApiResponse<any>(r));
      setMedia(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (itemUrl: string, id: string) => {
    navigator.clipboard.writeText(itemUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setErrorMsg('Title and Image URL are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url,
          altText: altText || title,
          caption,
          mimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add media item.');
      }

      setSuccessMsg('Media item added successfully!');
      setTitle('');
      setUrl('');
      setAltText('');
      setCaption('');
      setIsModalOpen(false);
      fetchMedia();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedia = async (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete media item.');
      }

      setSuccessMsg(`Media "${itemTitle}" deleted.`);
      fetchMedia();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete.');
    }
  };

  const filteredMedia = media.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Media Library Vault
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage article covers, inline imagery, and uploaded magazine assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMedia}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Media Asset
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Search media by title or alt text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-stone-800 placeholder-stone-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-stone-400 hover:text-stone-600 text-xs px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="text-stone-800 font-serif font-bold text-base">No media assets found</div>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm
              ? `No items match "${searchTerm}". Try a different search.`
              : 'Your media library is empty. Click "Add Media Asset" to register an image URL or banner.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-pink-300 transition group flex flex-col"
            >
              <div className="aspect-video relative bg-stone-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://picsum.photos/seed/sereia_media/400/250';
                  }}
                />
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  {item.altText && (
                    <p className="text-[10px] text-stone-500 truncate" title={item.altText}>
                      Alt: {item.altText}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="p-1.5 text-stone-500 hover:text-pink-600 hover:bg-pink-50 rounded transition text-xs flex items-center gap-1"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-medium">
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteMedia(item.id, item.title)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Delete media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-pink-600" /> Add Media Asset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Northeast Hills Sunset Cover"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-pink-600"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Provide an external CDN image link or Unsplash / static media URL.
                </p>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Alt Text (for SEO & Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Descriptive alt text for screen readers"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Caption / Photo Credit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photo by Sereia Editorial Studio"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-pink-600"
                />
              </div>

              {url && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase">
                    Preview
                  </span>
                  <div className="h-32 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://picsum.photos/seed/broken/400/250';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Media Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
