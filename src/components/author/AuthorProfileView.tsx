'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { User as UserType } from '@/types';

interface AuthorProfileViewProps {
  user: UserType;
  stats?: {
    totalPosts: number;
    publishedCount: number;
    totalViews: number;
  };
}

export function AuthorProfileView({ user, stats }: AuthorProfileViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
            Author Profile
          </h1>
          <p className="text-xs text-stone-500">
            Your public author profile details and biography displayed across Sereia
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user.username && (
            <Link
              href={`/author/${user.username.replace(/[\._\s]+/g, '-')}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-full transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public View</span>
            </Link>
          )}

          <Link
            href="/author/settings/profile/edit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-full shadow-xs transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-stone-100">
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-pink-200 shadow-md ring-4 ring-pink-50"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 text-white flex items-center justify-center text-3xl font-serif font-black shadow-md">
              {user.name?.charAt(0) || 'A'}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
                {user.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200">
                Author
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-stone-500 flex-wrap">
              <span className="font-mono">@{user.username || 'username'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{user.email}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed pt-1">
              {user.bio || 'No biography written yet. Click Edit Profile to add your bio.'}
            </p>
          </div>
        </div>

        {/* Public Social Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Connected Social & Web Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700">
              <Globe className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="truncate">{user.website || 'No website specified'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700">
              <Twitter className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate">{user.twitter || 'No Twitter profile'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700">
              <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="truncate">{user.instagram || 'No Instagram profile'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700">
              <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{user.linkedin || 'No LinkedIn profile'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
