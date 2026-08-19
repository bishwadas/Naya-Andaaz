'use client';

import React, { useState, useEffect } from 'react';
import {
  Video as VideoIcon,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Check,
  Play
} from 'lucide-react';
import { Category, Video } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface VideosManagerProps {
  categories: Category[];
}

export const VideosManager: React.FC<VideosManagerProps> = ({ categories }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [provider, setProvider] = useState<'youtube' | 'vimeo' | 'mp4'>('youtube');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await parseApiResponse<any>(res);
      setVideos(Array.isArray(data) ? data : data.videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingVideo(null);
    setTitle('');
    setSlug('');
    setVideoUrl('');
    setProvider('youtube');
    setThumbnail('');
    setDuration('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setIsFeatured(false);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const startEdit = (vid: Video) => {
    setEditingVideo(vid);
    setTitle(vid.title);
    setSlug(vid.slug);
    setVideoUrl(vid.videoUrl);
    setProvider(vid.provider);
    setThumbnail(vid.thumbnail);
    setDuration(vid.duration || '');
    setDescription(vid.description || '');
    setCategoryId(vid.categoryId || categories[0]?.id || '');
    setIsFeatured(vid.isFeatured);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setErrorMsg('Title and Video URL are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingVideo ? `/api/videos/${editingVideo.id}` : '/api/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          videoUrl,
          provider,
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
          duration,
          description,
          categoryId,
          isFeatured,
        }),
      });

      await parseApiResponse<any>(res);

      setSuccessMsg('Video saved successfully!');
      fetchVideos();
      setTimeout(() => setIsModalOpen(false), 500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      fetchVideos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={startCreate}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Video Feature
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Grid of Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((v) => (
          <div key={v.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="relative aspect-video bg-stone-950">
              <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              {v.duration && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                  {v.duration}
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-serif font-bold text-white text-sm line-clamp-2">{v.title}</h4>
                <p className="text-xs text-stone-400 line-clamp-2 mt-1">{v.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {v.provider}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(v)}
                    className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 rounded text-stone-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white rounded text-stone-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-white text-base">
                {editingVideo ? 'Edit Video Feature' : 'Add New Video Feature'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            {errorMsg && <div className="text-xs text-rose-400">{errorMsg}</div>}

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Video Embed / Source URL *</label>
              <input
                type="text"
                required
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="mp4">Direct MP4</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="08:45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Thumbnail URL</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Video'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
