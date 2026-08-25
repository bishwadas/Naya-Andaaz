'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/lib/auth-client';
import { parseApiResponse } from '@/lib/api';

export function ProfileManager() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    avatar: '',
    bio: '',
    website: '',
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        instagram: user.instagram || '',
        linkedin: user.linkedin || '',
        password: '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      await parseApiResponse<any>(res);

      setSuccess('Profile and credentials updated successfully');
      setFormData((prev) => ({ ...prev, password: '' }));
      if (refreshUser) refreshUser();
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl flex items-center gap-4">
        <img
          src={formData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'admin'}`}
          alt={formData.name}
          className="w-16 h-16 rounded-full border-2 border-amber-400 bg-stone-950 object-cover flex-shrink-0"
        />
        <div>
          <h3 className="font-serif font-bold text-white text-xl">{user?.name || 'Editorial Staff'}</h3>
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-1">
            <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold uppercase">
              {user?.role || 'ADMIN'}
            </span>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveProfile} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
        <h4 className="font-serif font-bold text-white text-base border-b border-stone-800 pb-3">
          Account & Editorial Identity
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Author Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Social Links */}
        <h4 className="font-serif font-bold text-white text-base border-b border-stone-800 pb-3 pt-2">
          Social Handles & Website
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-stone-400 mb-1">Website URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-stone-400 mb-1">Twitter / X Handle</label>
            <input
              type="text"
              placeholder="@username"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Security Password Change */}
        <h4 className="font-serif font-bold text-white text-base border-b border-stone-800 pb-3 pt-2">
          Security & Password Change
        </h4>

        <div>
          <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
            New Password (Leave blank if you don't want to change)
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Profile Changes
        </button>
      </form>
    </div>
  );
}
