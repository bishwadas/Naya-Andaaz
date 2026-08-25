'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Upload
} from 'lucide-react';
import { User as UserType } from '@/types';

interface AuthorProfileEditProps {
  user: UserType;
}

export function AuthorProfileEdit({ user }: AuthorProfileEditProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [twitter, setTwitter] = useState(user.twitter || '');
  const [instagram, setInstagram] = useState(user.instagram || '');
  const [facebook, setFacebook] = useState(user.facebook || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim() || null,
          bio: bio.trim() || null,
          website: website.trim() || null,
          twitter: twitter.trim() || null,
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
          linkedin: linkedin.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update author profile.');
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        router.push('/author/settings/profile');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/author/settings/profile"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
              Edit Author Profile
            </h1>
            <p className="text-xs text-stone-500">
              Update your public byline, avatar, biography, and social links
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Full Name (Display Byline)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Avatar Image URL
          </label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {avatar && (
            <div className="pt-2 flex items-center gap-3">
              <img
                src={avatar}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
              />
              <span className="text-[11px] text-stone-500">Avatar Preview</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Author Biography
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Write a brief professional overview of your background, beats, and expertise..."
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Social & Web Links */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Social Accounts & Website
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">Personal Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">Twitter / X Username</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">Instagram Username</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">LinkedIn Profile URL</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
          <Link
            href="/author/settings/profile"
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
