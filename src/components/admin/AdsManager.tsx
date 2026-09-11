'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Check,
  DollarSign
} from 'lucide-react';
import { Advertisement } from '@/types';
import { parseApiResponse } from '@/lib/api';

export const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState<'header' | 'sidebar' | 'in_article' | 'footer'>('header');
  const [type, setType] = useState<'image' | 'code' | 'ad_network'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads');
      const data = await parseApiResponse<any>(res);
      setAds(Array.isArray(data) ? data : data.ads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingAd(null);
    setTitle('');
    setLocation('header');
    setType('image');
    setImageUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200');
    setTargetUrl('');
    setCode('');
    setStatus('active');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const startEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setLocation(ad.location);
    setType(ad.type);
    setImageUrl(ad.imageUrl || '');
    setTargetUrl(ad.targetUrl || '');
    setCode(ad.code || '');
    setStatus(ad.status);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingAd ? `/api/ads/${editingAd.id}` : '/api/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          type,
          imageUrl,
          targetUrl,
          code,
          status,
        }),
      });

      await parseApiResponse<any>(res);

      setSuccessMsg('Advertisement unit updated successfully!');
      fetchAds();
      setTimeout(() => setIsModalOpen(false), 500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad unit?')) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      fetchAds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">Commercial Ad Units</h3>
            <p className="text-xs text-stone-400">Header, in-article, and sidebar marketing banners</p>
          </div>
        </div>

        <button
          onClick={startCreate}
          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Create Ad Unit
        </button>
      </div>

      {/* Grid of Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                  {ad.location}
                </span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                  ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-400'
                }`}>
                  {ad.status}
                </span>
              </div>
              <h4 className="font-serif font-bold text-white text-base mt-2">{ad.title}</h4>
              {ad.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-stone-800 bg-stone-950 aspect-video">
                  <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs text-stone-400">
              <span className="font-mono text-[11px]">{ad.impressions || 0} views • {ad.clicks || 0} clicks</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(ad)}
                  className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-300 rounded transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white text-stone-400 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-white text-base">
                {editingAd ? 'Edit Ad Placement' : 'Create Ad Placement'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Ad Unit Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="header">Header Banner</option>
                  <option value="sidebar">Sidebar Banner</option>
                  <option value="in_article">In-Article Feed</option>
                  <option value="footer">Footer Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="active">Active (Serving)</option>
                  <option value="inactive">Inactive (Paused)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Banner Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Target Clickthrough URL</label>
              <input
                type="text"
                placeholder="https://sponsor.com/landing..."
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Ad Unit'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
