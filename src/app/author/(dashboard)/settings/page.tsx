import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User, Lock, Bell, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuthorSettingsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
          Author Settings
        </h1>
        <p className="text-xs text-stone-500">
          Manage your account preferences and author configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <Link
          href="/author/settings/profile"
          className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-xs transition space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-100 transition">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-pink-600 group-hover:translate-x-0.5 transition">
              Manage →
            </span>
          </div>
          <h2 className="text-sm font-bold text-stone-900">Public Byline & Bio</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Update your author avatar, biography, social accounts, and personal website link.
          </p>
        </Link>

        {/* Security / Password */}
        <Link
          href="/account/password"
          className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-xs transition space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-700 group-hover:translate-x-0.5 transition">
              Change →
            </span>
          </div>
          <h2 className="text-sm font-bold text-stone-900">Security & Password</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Update your login password and manage session authentication settings.
          </p>
        </Link>
      </div>
    </div>
  );
}
