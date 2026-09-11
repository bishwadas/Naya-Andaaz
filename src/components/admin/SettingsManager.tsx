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
  Database,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  FileImage,
  Sparkles,
  ExternalLink,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react';
import { SiteSettings, SocialLinkItem } from '@/types';
import { DEFAULT_ABOUT_US_CONFIG } from '@/lib/constants';
import { parseApiResponse } from '@/lib/api';
import { ImportExportBackup } from './ImportExportBackup';

export function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<'logoPrimary' | 'logoMobile' | 'logoFooter' | 'favicon' | 'defaultOgImage' | null>(null);
  const [activeTab, setActiveTab] = useState<'logo_management' | 'general' | 'editorial' | 'seo' | 'social' | 'monetization' | 'about_us' | 'import_export'>('logo_management');

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

  const handleLogoFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    logoType: 'logoPrimary' | 'logoMobile' | 'logoFooter' | 'favicon' | 'defaultOgImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingType(logoType);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const updatedSettings: SiteSettings = {
        ...settings,
        [logoType]: data.url,
        ...(logoType === 'logoPrimary' ? { logo: data.url, logo_url: data.url } : {}),
        ...(logoType === 'logoFooter' ? { logoFooter: data.url, footer_logo_url: data.url } : {}),
      };

      setSettings(updatedSettings);

      // Instantly save to DB
      const saveRes = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (saveRes.ok) {
        setSuccess(`${logoType === 'logoPrimary' ? 'Primary Logo' : logoType === 'logoMobile' ? 'Mobile Logo' : logoType === 'logoFooter' ? 'Footer Logo' : logoType === 'defaultOgImage' ? 'Default OG Image' : 'Favicon'} updated & persisted successfully!`);
      } else {
        setSuccess(`${logoType} uploaded. Please click "Save Changes" to save.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemoveLogo = async (logoType: 'logoPrimary' | 'logoMobile' | 'logoFooter' | 'favicon' | 'defaultOgImage') => {
    if (!settings) return;
    setError(null);
    setSuccess(null);

    const updatedSettings: SiteSettings = {
      ...settings,
      [logoType]: '',
      ...(logoType === 'logoPrimary' ? { logo: '', logo_url: '' } : {}),
      ...(logoType === 'logoFooter' ? { logoFooter: '', footer_logo_url: '' } : {}),
    };

    setSettings(updatedSettings);

    try {
      const saveRes = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (saveRes.ok) {
        setSuccess(`${logoType === 'logoPrimary' ? 'Primary Logo' : logoType === 'logoMobile' ? 'Mobile Logo' : logoType === 'logoFooter' ? 'Footer Logo' : logoType === 'defaultOgImage' ? 'Default OG Image' : 'Favicon'} removed.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove logo');
    }
  };

  const getEffectiveSocialLinks = (): SocialLinkItem[] => {
    if (!settings) return [];
    if (Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0) {
      return settings.socialLinks;
    }
    const defaults: SocialLinkItem[] = [];
    if (settings.facebookUrl) defaults.push({ id: 'soc_fb', platform: 'facebook', label: 'Facebook', url: settings.facebookUrl, isEnabled: true, order: 0 });
    if (settings.instagramUrl) defaults.push({ id: 'soc_ig', platform: 'instagram', label: 'Instagram', url: settings.instagramUrl, isEnabled: true, order: 1 });
    if (settings.twitterUrl) defaults.push({ id: 'soc_tw', platform: 'twitter', label: 'X (Twitter)', url: settings.twitterUrl, isEnabled: true, order: 2 });
    if (settings.youtubeUrl) defaults.push({ id: 'soc_yt', platform: 'youtube', label: 'YouTube', url: settings.youtubeUrl, isEnabled: true, order: 3 });
    if (settings.pinterestUrl) defaults.push({ id: 'soc_pin', platform: 'pinterest', label: 'Pinterest', url: settings.pinterestUrl, isEnabled: true, order: 4 });
    if (settings.linkedinUrl) defaults.push({ id: 'soc_li', platform: 'linkedin', label: 'LinkedIn', url: settings.linkedinUrl, isEnabled: true, order: 5 });
    
    if (defaults.length === 0) {
      defaults.push(
        { id: 'soc_fb', platform: 'facebook', label: 'Facebook', url: 'https://facebook.com', isEnabled: true, order: 0 },
        { id: 'soc_ig', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', isEnabled: true, order: 1 },
        { id: 'soc_tw', platform: 'twitter', label: 'X (Twitter)', url: 'https://x.com', isEnabled: true, order: 2 },
        { id: 'soc_yt', platform: 'youtube', label: 'YouTube', url: 'https://youtube.com', isEnabled: true, order: 3 }
      );
    }
    return defaults;
  };

  const handleAddSocialLink = (presetPlatform?: string) => {
    if (!settings) return;
    const currentList = getEffectiveSocialLinks();
    const platformName = presetPlatform || 'custom';
    const newLink: SocialLinkItem = {
      id: `soc_${Date.now()}`,
      platform: platformName,
      label: platformName === 'custom' ? 'Custom Link' : platformName.charAt(0).toUpperCase() + platformName.slice(1),
      url: 'https://',
      isEnabled: true,
      order: currentList.length,
    };
    const updatedList = [...currentList, newLink];
    setSettings({
      ...settings,
      socialLinks: updatedList,
    });
  };

  const handleUpdateSocialLink = (id: string, updates: Partial<SocialLinkItem>) => {
    if (!settings) return;
    const currentList = getEffectiveSocialLinks();
    const updatedList = currentList.map((item) => (item.id === id ? { ...item, ...updates } : item));
    
    // Also sync legacy fields
    const fb = updatedList.find((i) => i.platform === 'facebook')?.url;
    const ig = updatedList.find((i) => i.platform === 'instagram')?.url;
    const tw = updatedList.find((i) => i.platform === 'twitter')?.url;
    const yt = updatedList.find((i) => i.platform === 'youtube')?.url;
    const pin = updatedList.find((i) => i.platform === 'pinterest')?.url;
    const li = updatedList.find((i) => i.platform === 'linkedin')?.url;

    setSettings({
      ...settings,
      socialLinks: updatedList,
      ...(fb !== undefined ? { facebookUrl: fb } : {}),
      ...(ig !== undefined ? { instagramUrl: ig } : {}),
      ...(tw !== undefined ? { twitterUrl: tw } : {}),
      ...(yt !== undefined ? { youtubeUrl: yt } : {}),
      ...(pin !== undefined ? { pinterestUrl: pin } : {}),
      ...(li !== undefined ? { linkedinUrl: li } : {}),
    });
  };

  const handleRemoveSocialLink = (id: string) => {
    if (!settings) return;
    const currentList = getEffectiveSocialLinks();
    const updatedList = currentList.filter((item) => item.id !== id);
    setSettings({
      ...settings,
      socialLinks: updatedList,
    });
  };

  const handleMoveSocialLink = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const currentList = [...getEffectiveSocialLinks()];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);

    const reordered = currentList.map((item, idx) => ({ ...item, order: idx }));
    setSettings({
      ...settings,
      socialLinks: reordered,
    });
  };

  if (loading && !settings) {
    return (
      <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-12 text-center text-[#6B625C] text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#EC008C]" /> Loading site settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#FFFDFC] border border-[#E5E0DA] p-5 rounded-xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 border border-pink-200 text-[#EC008C] rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#171717] text-base">Global Portal Configuration</h3>
            <p className="text-xs text-[#6B625C]">Site branding, centralized logo management, default SEO tags, ticker messages, and advertising settings</p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 bg-white border border-[#DDD6D0] hover:bg-[#F3F0EC] text-[#6B625C] rounded-lg text-xs transition self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E0DA] pb-3">
        <button
          id="admin-settings-tab-logo"
          onClick={() => setActiveTab('logo_management')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'logo_management' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" /> Logo Management
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'general' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <Globe className="w-4 h-4" /> General Branding
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'editorial' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <Sliders className="w-4 h-4" /> Editorial & Feeds
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'seo' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <Search className="w-4 h-4" /> Default SEO
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'social' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <Share2 className="w-4 h-4" /> Social Accounts
        </button>
        <button
          onClick={() => setActiveTab('monetization')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'monetization' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Ads & Monetization
        </button>
        <button
          onClick={() => setActiveTab('about_us')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'about_us' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-pink-500" /> About Us Page
        </button>
        <button
          id="admin-settings-tab-import-export"
          onClick={() => setActiveTab('import_export')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'import_export' ? 'bg-[#EC008C] text-white font-bold shadow-xs' : 'bg-[#FFFDFC] text-[#6B625C] border border-[#E5E0DA] hover:text-[#171717] hover:bg-[#F3F0EC]'
          }`}
        >
          <Database className="w-4 h-4 text-purple-600" /> Import & Export
        </button>
      </div>

      {activeTab === 'import_export' ? (
        <ImportExportBackup />
      ) : settings ? (
        <form onSubmit={handleSaveSettings} className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-6 space-y-6 shadow-xs">
          {activeTab === 'logo_management' && (
            <div className="space-y-6">
              <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-[#171717] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EC008C]" /> Centralized Logo Management
                  </h4>
                  <p className="text-[#6B625C] mt-0.5">
                    Upload website logos here to automatically update header, mobile navigation drawer, and footer across all pages.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#EC008C] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full shrink-0">
                  PNG, SVG, WebP, JPG, ICO supported
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. PRIMARY LOGO */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EC008C] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded">
                        Desktop Header
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Primary Website Logo</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">250 × 50 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Main brand identity logo displayed in desktop navbar header.
                  </p>

                  {/* Preview Container */}
                  <div className="relative min-h-[100px] bg-white border border-dashed border-[#DDD6D0] rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden group">
                    {(settings.logoPrimary || settings.logo) ? (
                      <div className="space-y-2 text-center">
                        <div className="bg-white p-3 rounded border border-[#E5E0DA] inline-block max-w-full">
                          <img
                            src={settings.logoPrimary || settings.logo}
                            alt="Primary Logo Preview"
                            className="h-12 w-auto max-w-[240px] object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#6B625C] truncate max-w-[280px] mx-auto">
                          {settings.logoPrimary || settings.logo}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-8 h-8 text-[#8A817A] mx-auto" />
                        <p className="text-xs font-semibold text-[#171717]">No primary logo uploaded</p>
                        <p className="text-[11px] text-[#6B625C]">Website renders default text logo: <span className="text-[#EC008C] font-serif font-bold">{settings.siteTitle || settings.siteName || 'SEREIA'}</span></p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'logoPrimary' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {(settings.logoPrimary || settings.logo) ? 'Replace Primary Logo' : 'Upload Primary Logo'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'logoPrimary')}
                        disabled={uploadingType === 'logoPrimary'}
                      />
                    </label>

                    {(settings.logoPrimary || settings.logo) && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('logoPrimary')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[11px] font-mono uppercase text-[#6B625C] mb-1">Direct URL Input</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={settings.logoPrimary || settings.logo || ''}
                      onChange={(e) => setSettings({ ...settings, logoPrimary: e.target.value, logo: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>

                {/* 2. MOBILE LOGO */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        Mobile Nav & Drawer
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Mobile Website Logo</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">180 × 40 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Displayed on mobile devices and slide-out menu drawer.
                  </p>

                  {/* Preview Container */}
                  <div className="relative min-h-[100px] bg-white border border-dashed border-[#DDD6D0] rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
                    {settings.logoMobile ? (
                      <div className="space-y-2 text-center">
                        <div className="bg-white p-3 rounded border border-[#E5E0DA] inline-block max-w-full">
                          <img
                            src={settings.logoMobile}
                            alt="Mobile Logo Preview"
                            className="h-9 w-auto max-w-[180px] object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#6B625C] truncate max-w-[280px] mx-auto">
                          {settings.logoMobile}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-8 h-8 text-[#8A817A] mx-auto" />
                        <p className="text-xs font-semibold text-[#171717]">No mobile logo configured</p>
                        <p className="text-[11px] text-[#6B625C]">
                          Falling back to Primary Logo or text (<span className="text-[#EC008C] font-serif font-bold">{settings.siteTitle || settings.siteName || 'SEREIA'}</span>)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'logoMobile' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {settings.logoMobile ? 'Replace Mobile Logo' : 'Upload Mobile Logo'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'logoMobile')}
                        disabled={uploadingType === 'logoMobile'}
                      />
                    </label>

                    {settings.logoMobile && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('logoMobile')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[11px] font-mono uppercase text-[#6B625C] mb-1">Direct URL Input</label>
                    <input
                      type="text"
                      placeholder="https://example.com/mobile-logo.png"
                      value={settings.logoMobile || ''}
                      onChange={(e) => setSettings({ ...settings, logoMobile: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>

                {/* 3. FOOTER LOGO */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        Footer Section
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Footer Logo</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">250 × 50 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Dedicated logo rendered exclusively in the website footer. Completely separate from Primary Header Logo.
                  </p>

                  {/* Preview Container */}
                  <div className="relative min-h-[100px] bg-stone-900 border border-dashed border-[#DDD6D0] rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
                    {(settings.footer_logo_url || settings.logoFooter) ? (
                      <div className="space-y-2 text-center">
                        <div className="p-3 rounded inline-block max-w-full">
                          <img
                            src={settings.footer_logo_url || settings.logoFooter}
                            alt="Footer Logo Preview"
                            className="h-10 w-auto max-w-[200px] object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-stone-300 truncate max-w-[280px] mx-auto">
                          {settings.footer_logo_url || settings.logoFooter}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-8 h-8 text-stone-500 mx-auto" />
                        <p className="text-xs font-semibold text-stone-200">No footer logo configured</p>
                        <p className="text-[11px] text-stone-400">
                          Falling back to brand text (<span className="text-white font-serif font-bold">{settings.siteTitle || settings.siteName || 'SEREIA'}</span>)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'logoFooter' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {(settings.footer_logo_url || settings.logoFooter) ? 'Replace Footer Logo' : 'Upload Footer Logo'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'logoFooter')}
                        disabled={uploadingType === 'logoFooter'}
                      />
                    </label>

                    {(settings.footer_logo_url || settings.logoFooter) && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('logoFooter')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                      </button>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[11px] font-mono uppercase text-[#6B625C] mb-1">Direct URL Input (footer_logo_url)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/footer-logo.png"
                      value={settings.footer_logo_url || settings.logoFooter || ''}
                      onChange={(e) => setSettings({ ...settings, footer_logo_url: e.target.value, logoFooter: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>

                {/* 4. FAVICON */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Browser Tab & App Icon
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Website Favicon</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">32 × 32 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Displayed in web browser tabs, bookmarks, and mobile shortcuts.
                  </p>

                  {/* Preview Container */}
                  <div className="relative min-h-[100px] bg-white border border-dashed border-[#DDD6D0] rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
                    {settings.favicon ? (
                      <div className="space-y-2 text-center">
                        <div className="bg-[#F7F5F2] p-2 rounded border border-[#E5E0DA] inline-block">
                          <img
                            src={settings.favicon}
                            alt="Favicon Preview"
                            className="w-8 h-8 object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#6B625C] truncate max-w-[280px] mx-auto">
                          {settings.favicon}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-8 h-8 text-[#8A817A] mx-auto" />
                        <p className="text-xs font-semibold text-[#171717]">No custom favicon configured</p>
                        <p className="text-[11px] text-[#6B625C]">Falling back to /favicon.ico</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'favicon' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {settings.favicon ? 'Replace Favicon' : 'Upload Favicon'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".ico,.png,.svg,.jpg"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'favicon')}
                        disabled={uploadingType === 'favicon'}
                      />
                    </label>

                    {settings.favicon && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('favicon')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[11px] font-mono uppercase text-[#6B625C] mb-1">Direct URL Input</label>
                    <input
                      type="text"
                      placeholder="https://example.com/favicon.ico"
                      value={settings.favicon || ''}
                      onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Portal Name</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C] font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Portal Description</label>
                <textarea
                  rows={3}
                  value={settings.siteDescription || ''}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Base Site URL</label>
                <input
                  type="text"
                  value={settings.siteUrl || ''}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#EC008C] font-mono focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Footer Copyright & Credit Text</label>
                <input
                  type="text"
                  placeholder="e.g. Copyright © 2026 Naya Andaaz, Inc. All rights reserved."
                  value={settings.copyrightText || ''}
                  onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
                <p className="text-[11px] text-[#6B625C] mt-1">
                  Custom copyright/credit text displayed at the bottom of the footer across all pages. If empty, the default template is used.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Primary Website Logo URL (Header)</label>
                <input
                  type="text"
                  value={settings.logo || settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value, logo_url: e.target.value, logoPrimary: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={settings.favicon || ''}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C] font-mono"
                />
              </div>

              {/* SEPARATE FOOTER LOGO CARD */}
              <div className="md:col-span-2 bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4 mt-2">
                <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                  <div>
                    <h4 className="font-bold text-[#171717] text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Footer Logo (footer_logo_url)
                    </h4>
                    <p className="text-xs text-[#6B625C] mt-0.5">
                      Separate logo exclusively for website footer. Primary Website Logo will NOT be used in the footer.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                    Recommended: 250 × 50 px
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 min-w-[220px] max-w-full text-center flex items-center justify-center min-h-[70px]">
                    {(settings.footer_logo_url || settings.logoFooter) ? (
                      <img
                        src={settings.footer_logo_url || settings.logoFooter}
                        alt="Footer Logo Preview"
                        className="h-10 w-auto max-w-[200px] object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs text-stone-400 italic">No Footer Logo set (text fallback active)</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#6B625C] mb-1">Direct Footer Logo URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/footer-logo.png"
                        value={settings.footer_logo_url || settings.logoFooter || ''}
                        onChange={(e) => setSettings({ ...settings, footer_logo_url: e.target.value, logoFooter: e.target.value })}
                        className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-purple-600 font-mono"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                        {uploadingType === 'logoFooter' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" /> {(settings.footer_logo_url || settings.logoFooter) ? 'Replace Footer Logo' : 'Upload Footer Logo'}
                          </>
                        )}
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => handleLogoFileUpload(e, 'logoFooter')}
                          disabled={uploadingType === 'logoFooter'}
                        />
                      </label>

                      {(settings.footer_logo_url || settings.logoFooter) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo('logoFooter')}
                          className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editorial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Articles Per Page</label>
                <input
                  type="number"
                  value={settings.postsPerPage || 12}
                  onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value, 10) || 12 })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Trending Ticker Notice Text</label>
                <input
                  type="text"
                  placeholder="Breaking news ticker announcement..."
                  value={settings.trendingTickerText || ''}
                  onChange={(e) => setSettings({ ...settings, trendingTickerText: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#EC008C] font-mono focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mt-2 mb-2">
                  <input
                    type="checkbox"
                    id="showOurAuthors"
                    checked={settings.showOurAuthorsOnAuthorPage !== false}
                    onChange={(e) => setSettings({ ...settings, showOurAuthorsOnAuthorPage: e.target.checked })}
                    className="accent-[#EC008C] rounded"
                  />
                  <label htmlFor="showOurAuthors" className="text-xs font-bold text-[#171717] uppercase font-mono">
                    Show "Our Authors" Section on Author Pages
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={settings.copyrightText || ''}
                  onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0DA] pb-4">
                <h4 className="font-bold text-[#171717] text-sm">Search Engine Optimization & Social Sharing</h4>
                <p className="text-xs text-[#6B625C]">
                  Configure global metadata, dynamic favicon, Open Graph social share graphics, canonical site URL, and search engine verification tokens.
                </p>
              </div>

              {/* Favicon & Social OG Banner Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. FAVICON / SITE ICON */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Search Result Icon & Browser Tab
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Favicon / Site Icon</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">32 × 32 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Displayed beside your site title in Google mobile search results, browser tabs, and bookmarks.
                  </p>

                  <div className="relative min-h-[90px] bg-white border border-dashed border-[#DDD6D0] rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
                    {settings.favicon ? (
                      <div className="space-y-2 text-center">
                        <div className="bg-[#F7F5F2] p-2.5 rounded-lg border border-[#E5E0DA] inline-block shadow-xs">
                          <img
                            src={settings.favicon}
                            alt="Favicon Preview"
                            className="w-8 h-8 object-contain mx-auto"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#6B625C] truncate max-w-[240px] mx-auto">
                          {settings.favicon}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-7 h-7 text-[#8A817A] mx-auto" />
                        <p className="text-xs font-semibold text-[#171717]">No custom favicon uploaded</p>
                        <p className="text-[11px] text-[#6B625C]">Using fallback: /favicon.ico</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'favicon' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {settings.favicon ? 'Replace Favicon' : 'Upload Favicon'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".ico,.png,.svg,.jpg,.webp"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'favicon')}
                        disabled={uploadingType === 'favicon'}
                      />
                    </label>

                    {settings.favicon && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('favicon')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[10px] font-mono uppercase text-[#6B625C] mb-1">Direct Favicon URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/favicon.ico"
                      value={settings.favicon || ''}
                      onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>

                {/* 2. DEFAULT OG SHARING IMAGE */}
                <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded">
                        Social Networks & WhatsApp
                      </span>
                      <h4 className="font-bold text-[#171717] text-sm mt-1">Default OG Share Image</h4>
                    </div>
                    <span className="text-[11px] text-[#6B625C] font-mono">1200 × 630 px</span>
                  </div>

                  <p className="text-xs text-[#6B625C]">
                    Preview image used on Facebook, X (Twitter), LinkedIn, and messaging apps when articles lack a featured image.
                  </p>

                  <div className="relative min-h-[90px] bg-white border border-dashed border-[#DDD6D0] rounded-lg p-3 flex flex-col items-center justify-center overflow-hidden">
                    {settings.defaultOgImage ? (
                      <div className="space-y-2 text-center w-full">
                        <div className="bg-[#F7F5F2] rounded-lg border border-[#E5E0DA] overflow-hidden max-h-[100px] w-full flex items-center justify-center">
                          <img
                            src={settings.defaultOgImage}
                            alt="Default OG Image Preview"
                            className="w-full h-full max-h-[100px] object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-[#6B625C] truncate max-w-[260px] mx-auto">
                          {settings.defaultOgImage}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <FileImage className="w-7 h-7 text-[#8A817A] mx-auto" />
                        <p className="text-xs font-semibold text-[#171717]">No default OG image set</p>
                        <p className="text-[11px] text-[#6B625C]">Falls back to primary site logo</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="flex-1 min-w-[130px] cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                      {uploadingType === 'defaultOgImage' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" /> {settings.defaultOgImage ? 'Replace Image' : 'Upload Image'}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoFileUpload(e, 'defaultOgImage')}
                        disabled={uploadingType === 'defaultOgImage'}
                      />
                    </label>

                    {settings.defaultOgImage && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('defaultOgImage')}
                        className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#DDD6D0] hover:border-rose-300 text-[#6B625C] hover:text-rose-600 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E5E0DA]">
                    <label className="block text-[10px] font-mono uppercase text-[#6B625C] mb-1">Direct OG Image URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/og-image.jpg"
                      value={settings.defaultOgImage || ''}
                      onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono uppercase text-[#6B625C]">
                      Default Portal SEO Title
                    </label>
                    <span className={`text-[11px] font-mono ${
                      (settings.defaultSeoTitle?.length || 0) > 60 ? 'text-amber-600 font-bold' : 'text-[#6B625C]'
                    }`}>
                      {settings.defaultSeoTitle?.length || 0} / 60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Naya Andaaz — Latest Entertainment, Lifestyle & Fashion News"
                    value={settings.defaultSeoTitle || ''}
                    onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                  <p className="text-[11px] text-[#6B625C] mt-1">
                    Primary title template for the homepage and browser title tag.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono uppercase text-[#6B625C]">
                      Default Meta Description
                    </label>
                    <span className={`text-[11px] font-mono ${
                      (settings.defaultMetaDescription?.length || 0) > 160 ? 'text-amber-600 font-bold' : 'text-[#6B625C]'
                    }`}>
                      {settings.defaultMetaDescription?.length || 0} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Naya Andaaz is your premier digital destination for the latest in Bollywood, OTT releases, lifestyle trends, wellness advice, travel diaries, and entertainment stories."
                    value={settings.defaultMetaDescription || ''}
                    onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                  <p className="text-[11px] text-[#6B625C] mt-1">
                    Summarizes website content in Google search engine snippets.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                    Base Site URL (Canonical Domain)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.nayaandaaz.com"
                    value={settings.siteUrl || ''}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                  />
                  <p className="text-[11px] text-[#6B625C] mt-1">
                    Overrides auto-detected host for canonical link tags and XML sitemaps.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                    Google Search Console Verification
                  </label>
                  <input
                    type="text"
                    placeholder="googlea42932e85653f824"
                    value={settings.searchConsoleVerification || ''}
                    onChange={(e) => setSettings({ ...settings, searchConsoleVerification: e.target.value })}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                  />
                  <p className="text-[11px] text-[#6B625C] mt-1">
                    Google HTML verification code (e.g. googlea42932e85653f824).
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                    Google Analytics GA4 Measurement ID
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#EC008C] font-mono focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Sitemap & Robots Status Card */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-[#171717] text-xs">Crawlability & XML Sitemaps</h5>
                  <p className="text-[11px] text-[#6B625C] mt-0.5">
                    Automatically indexed and updated dynamically from published articles and category trees.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-[#DDD6D0] hover:bg-stone-100 text-xs font-mono font-medium rounded-lg text-[#171717] transition"
                  >
                    /sitemap.xml ↗
                  </a>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-[#DDD6D0] hover:bg-stone-100 text-xs font-mono font-medium rounded-lg text-[#171717] transition"
                  >
                    /robots.txt ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0DA] pb-4">
                <div>
                  <h4 className="font-bold text-[#171717] text-sm">Social Media Channels</h4>
                  <p className="text-xs text-[#6B625C]">
                    Manage social profiles displayed in the website header, footer, and article share buttons.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddSocialLink()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EC008C] hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Social Link
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#6B625C]">
                <span className="font-mono text-[11px] uppercase">Quick Add:</span>
                {['facebook', 'instagram', 'twitter', 'youtube', 'pinterest', 'linkedin', 'tiktok', 'threads'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddSocialLink(preset)}
                    className="px-2.5 py-1 bg-[#F7F5F2] hover:bg-[#EBE7E1] border border-[#DDD6D0] text-[#171717] text-[11px] rounded-md transition font-medium capitalize"
                  >
                    + {preset === 'twitter' ? 'X / Twitter' : preset}
                  </button>
                ))}
              </div>

              {/* Social Links List */}
              <div className="space-y-3">
                {getEffectiveSocialLinks().map((link, index, array) => (
                  <div
                    key={link.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      link.isEnabled
                        ? 'bg-white border-[#DDD6D0] shadow-xs'
                        : 'bg-[#F9F7F5] border-dashed border-[#DDD6D0] opacity-75'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Platform selector */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-mono uppercase text-[#6B625C] mb-0.5">Platform</label>
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(link.id, { platform: e.target.value })}
                          className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] font-medium capitalize focus:outline-none focus:border-[#EC008C]"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="twitter">X / Twitter</option>
                          <option value="youtube">YouTube</option>
                          <option value="pinterest">Pinterest</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="tiktok">TikTok</option>
                          <option value="threads">Threads</option>
                          <option value="telegram">Telegram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="custom">Custom / Other</option>
                        </select>
                      </div>

                      {/* Label input */}
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-mono uppercase text-[#6B625C] mb-0.5">Label</label>
                        <input
                          type="text"
                          value={link.label || ''}
                          onChange={(e) => handleUpdateSocialLink(link.id, { label: e.target.value })}
                          placeholder="e.g. Official Facebook"
                          className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                        />
                      </div>

                      {/* URL input */}
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-mono uppercase text-[#6B625C] mb-0.5">Profile / Channel URL</label>
                        <div className="relative">
                          <input
                            type="url"
                            value={link.url || ''}
                            onChange={(e) => handleUpdateSocialLink(link.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                          />
                        </div>
                      </div>

                      {/* Controls: Enable/Disable, Move Up/Down, Delete */}
                      <div className="md:col-span-2 flex items-center justify-end gap-1 pt-2 md:pt-4">
                        {/* Toggle Enable */}
                        <button
                          type="button"
                          onClick={() => handleUpdateSocialLink(link.id, { isEnabled: !link.isEnabled })}
                          title={link.isEnabled ? 'Enabled (Click to hide)' : 'Disabled (Click to show)'}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            link.isEnabled
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {link.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSocialLink(index, 'up')}
                          title="Move Up"
                          className="p-1.5 bg-white border border-[#DDD6D0] hover:bg-[#F3F0EC] text-[#6B625C] disabled:opacity-30 rounded-lg text-xs transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === array.length - 1}
                          onClick={() => handleMoveSocialLink(index, 'down')}
                          title="Move Down"
                          className="p-1.5 bg-white border border-[#DDD6D0] hover:bg-[#F3F0EC] text-[#6B625C] disabled:opacity-30 rounded-lg text-xs transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(link.id)}
                          title="Delete link"
                          className="p-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  className="accent-[#EC008C] rounded"
                />
                <label htmlFor="enableAds" className="text-xs font-bold text-[#171717] uppercase font-mono">
                  Enable Site-wide Ads Placements
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Header Top Banner Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.headerAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, headerAdHtml: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Sidebar Banner Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.sidebarAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, sidebarAdHtml: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">In-Article Content Feed Ad Code</label>
                <textarea
                  rows={3}
                  value={settings.inArticleAdHtml || ''}
                  onChange={(e) => setSettings({ ...settings, inArticleAdHtml: e.target.value })}
                  className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] font-mono focus:outline-none focus:border-[#EC008C]"
                />
              </div>
            </div>
          )}

          {activeTab === 'about_us' && (
            <div className="space-y-6">
              <div className="border-b border-[#E5E0DA] pb-4">
                <h3 className="text-sm font-bold text-[#171717]">About Us Page Configuration</h3>
                <p className="text-xs text-[#6B625C]">Manage all content, headers, categories, mission, editorial approach, readers, and contact CTAs for the About Us page.</p>
              </div>

              {/* Hero Section */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Hero Section</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.heroTitle ?? DEFAULT_ABOUT_US_CONFIG.heroTitle}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, heroTitle: e.target.value } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Hero Description</label>
                  <textarea
                    rows={3}
                    value={settings.aboutUs?.heroDescription ?? DEFAULT_ABOUT_US_CONFIG.heroDescription}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, heroDescription: e.target.value } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* About Section */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">About Naya Andaaz Section</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Section Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.aboutSection?.title ?? DEFAULT_ABOUT_US_CONFIG.aboutSection.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, aboutSection: { ...aboutUs.aboutSection, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Section Description / Content</label>
                  <textarea
                    rows={5}
                    value={settings.aboutUs?.aboutSection?.description ?? DEFAULT_ABOUT_US_CONFIG.aboutSection.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, aboutSection: { ...aboutUs.aboutSection, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Our Mission */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Our Mission</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.mission?.title ?? DEFAULT_ABOUT_US_CONFIG.mission.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, mission: { ...aboutUs.mission, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={settings.aboutUs?.mission?.description ?? DEFAULT_ABOUT_US_CONFIG.mission.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, mission: { ...aboutUs.mission, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Our Editorial Approach */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Our Editorial Approach</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.editorialApproach?.title ?? DEFAULT_ABOUT_US_CONFIG.editorialApproach.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, editorialApproach: { ...aboutUs.editorialApproach, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={settings.aboutUs?.editorialApproach?.description ?? DEFAULT_ABOUT_US_CONFIG.editorialApproach.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, editorialApproach: { ...aboutUs.editorialApproach, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Why Naya Andaaz? */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Why Naya Andaaz?</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.whyNayaAndaaz?.title ?? DEFAULT_ABOUT_US_CONFIG.whyNayaAndaaz.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, whyNayaAndaaz: { ...aboutUs.whyNayaAndaaz, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Our Readers */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Our Readers</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.readers?.title ?? DEFAULT_ABOUT_US_CONFIG.readers.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, readers: { ...aboutUs.readers, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={settings.aboutUs?.readers?.description ?? DEFAULT_ABOUT_US_CONFIG.readers.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, readers: { ...aboutUs.readers, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Commitment to Readers */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Our Commitment to Readers</h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.aboutUs?.commitment?.title ?? DEFAULT_ABOUT_US_CONFIG.commitment.title}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, commitment: { ...aboutUs.commitment, title: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={settings.aboutUs?.commitment?.description ?? DEFAULT_ABOUT_US_CONFIG.commitment.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, commitment: { ...aboutUs.commitment, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

              {/* Contact Us CTA Section */}
              <div className="bg-[#F7F5F2] p-4 rounded-xl border border-[#E5E0DA] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#171717] uppercase">Contact Us CTA Section</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Button Text</label>
                    <input
                      type="text"
                      value={settings.aboutUs?.contact?.buttonText ?? DEFAULT_ABOUT_US_CONFIG.contact.buttonText}
                      onChange={(e) => {
                        const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                        setSettings({ ...settings, aboutUs: { ...aboutUs, contact: { ...aboutUs.contact, buttonText: e.target.value } } });
                      }}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Button URL / Link</label>
                    <input
                      type="text"
                      value={settings.aboutUs?.contact?.buttonUrl ?? DEFAULT_ABOUT_US_CONFIG.contact.buttonUrl}
                      onChange={(e) => {
                        const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                        setSettings({ ...settings, aboutUs: { ...aboutUs, contact: { ...aboutUs.contact, buttonUrl: e.target.value } } });
                      }}
                      className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={settings.aboutUs?.contact?.description ?? DEFAULT_ABOUT_US_CONFIG.contact.description}
                    onChange={(e) => {
                      const aboutUs = settings.aboutUs || DEFAULT_ABOUT_US_CONFIG;
                      setSettings({ ...settings, aboutUs: { ...aboutUs, contact: { ...aboutUs.contact, description: e.target.value } } });
                    }}
                    className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
                  />
                </div>
              </div>

            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#EC008C] hover:bg-pink-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Global Portal Configuration
          </button>
        </form>
      ) : null}
    </div>
  );
}
