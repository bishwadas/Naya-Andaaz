'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { User as UserType } from '@/types';

interface SubscriberProfileClientProps {
  user: UserType;
}

export function SubscriberProfileClient({ user }: SubscriberProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.bio || '');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isStaff =
    user.role?.toUpperCase() === 'ADMIN' ||
    user.role?.toUpperCase() === 'EDITOR' ||
    user.role?.toUpperCase() === 'AUTHOR';

  const dashboardUrl =
    user.role?.toUpperCase() === 'ADMIN'
      ? '/admin'
      : user.role?.toUpperCase() === 'EDITOR'
      ? '/editor'
      : user.role?.toUpperCase() === 'AUTHOR'
      ? '/author'
      : null;

  const dashboardLabel =
    user.role?.toUpperCase() === 'ADMIN'
      ? 'Admin Dashboard'
      : user.role?.toUpperCase() === 'EDITOR'
      ? 'Editorial Desk'
      : user.role?.toUpperCase() === 'AUTHOR'
      ? 'Author Dashboard'
      : '';

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update account profile.');
      }

      setSuccessMsg('Account details saved successfully!');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
          My Account
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Manage your reader profile, newsletter preferences, and account credentials
        </p>
      </div>

      {/* Staff Workspace Banner (if author/editor/admin) */}
      {isStaff && dashboardUrl && (
        <div className="bg-gradient-to-r from-stone-900 to-purple-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-stone-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Staff Access</span>
            </div>
            <p className="text-sm font-serif font-bold text-stone-100">
              You are signed in with <span className="text-pink-400 capitalize">{user.role.toLowerCase()}</span> privileges.
            </p>
            <p className="text-xs text-stone-400">
              Access your dedicated publishing and editorial workspace.
            </p>
          </div>

          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-full shadow-xs transition shrink-0"
          >
            <span>Go to {dashboardLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Navigation tabs for Account */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <Link
          href="/account/profile"
          className="px-4 py-2 text-xs sm:text-sm font-bold text-stone-900 border-b-2 border-pink-600 -mb-2.5 transition"
        >
          Profile Information
        </Link>
        <Link
          href="/account/password"
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 transition"
        >
          Security & Password
        </Link>
      </div>

      {/* Alerts */}
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

      {/* Main Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xs space-y-6 self-start">
          <div className="text-center space-y-3">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-pink-300 ring-4 ring-pink-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-900 text-white flex items-center justify-center text-2xl font-serif font-black mx-auto">
                {name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-stone-900">{name || 'Reader'}</h2>
              <p className="text-xs text-stone-500 font-mono">@{user.username || 'username'}</p>
            </div>
            <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-stone-200 font-mono">
              {user.role}
            </span>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
              <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Email Address (Read-Only)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed"
            />
          </div>

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
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              About Me / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us a little bit about yourself..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
