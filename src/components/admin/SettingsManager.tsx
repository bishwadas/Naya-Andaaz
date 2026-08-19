'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Search,
  Share2,
  DollarSign,
  Mail,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import { SiteSettings } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { ImportExportBackup } from './ImportExportBackup';

export function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'editorial' | 'seo' | 'social' | 'monetization' | 'import_export'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await parseApiResponse<any>(res);
      setSettings(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await parseApiResponse<any>(res);

      setSuccess('Site configuration saved successfully');
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading site settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">Global Portal Configuration</h3>
            <p className="text-xs text-stone-400">Site branding, default SEO tags, ticker messages, and advertising settings</p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-400 rounded-lg text-xs transition self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'general' ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" /> General Branding
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'editorial' ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Editorial & Feeds
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'seo' ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" /> Default SEO
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'social' ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" /> Social Accounts
        </button>
        <button
          onClick={() => setActiveTab('monetization')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'monetization' ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Ads & Monetization
        </button>
        <button
          id="admin-settings-tab-import-export"
          onClick={() => setActiveTab('import_export')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'import_export' ? 'bg-rose-600 text-white shadow-md' : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-rose-300" /> Import & Export
        </button>
      </div>

      {activeTab === 'import_export' ? (
        <ImportExportBackup />
      ) : settings ? (
        <form onSubmit={handleSaveSettings} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Portal Name</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Portal Description</label>
                <textarea
                  rows={3}
                  value={settings.siteDescription || ''}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Base Site URL</label>
                <input
                  type="text"
                  value={settings.siteUrl || ''}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={settings.favicon || ''}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {activeTab === 'editorial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Articles Per Page</label>
                <input
                  type="number"
                  value={settings.postsPerPage || 12}
                  onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value, 10) || 12 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Trending Ticker Notice Text</label>
                <input
                  type="text"
                  placeholder="Breaking news ticker announcement..."
                  value={settings.trendingTickerText || ''}
                  onChange={(e) => setSettings({ ...settings, trendingTickerText: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={settings.copyrightText || ''}
                  onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Default Title Pattern</label>
                <input
                  type="text"
                  value={settings.defaultSeoTitle || ''}
                  onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Default Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.defaultMetaDescription || ''}
                  onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Default OG Sharing Image URL</label>
                <input
                  type="text"
                  value={settings.defaultOgImage || ''}
                  onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Google Analytics Measurement ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Twitter / X Page</label>
                <input
                  type="text"
                  value={settings.twitterUrl || ''}
                  onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Facebook Page</label>
                <input
                  type="text"
                  value={settings.facebookUrl || ''}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Instagram Account</label>
                <input
                  type="text"
                  value={settings.instagramUrl || ''}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">YouTube Channel</label>
                <input
                  type="text"
                  value={settings.youtubeUrl || ''}
                  onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {activeTab === 'monetization' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableAds"
                  checked={settings.enableAds}
                  onChange={(e) => setSettings({ ...settings, enableAds: e.target.checked })}
                  className="accent-amber-400 rounded"
                />
                <label htmlFor="enableAds" className="text-xs font-bold text-white uppercase font-mono">
                  Enable Site-wide Ads Placements
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Header Top Banner Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.headerAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, headerAdHtml: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Sidebar Banner Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.sidebarAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, sidebarAdHtml: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">In-Article Content Feed Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.inArticleAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, inArticleAdHtml: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Global Portal Configuration
          </button>
        </form>
      ) : null}
    </div>
  );
}
