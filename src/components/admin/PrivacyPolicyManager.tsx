'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  BarChart3,
  ShieldCheck,
  Share2,
  Lock,
  Mail,
  FileText,
  Edit3,
  PhoneCall,
  Globe,
  Key
} from 'lucide-react';
import { parseApiResponse } from '@/lib/api';

const AVAILABLE_ICONS = [
  { label: 'User', value: 'User' },
  { label: 'Bar Chart', value: 'BarChart3' },
  { label: 'Shield Check', value: 'ShieldCheck' },
  { label: 'Share', value: 'Share2' },
  { label: 'Lock', value: 'Lock' },
  { label: 'Mail', value: 'Mail' },
  { label: 'File Text', value: 'FileText' },
  { label: 'Edit / Pen', value: 'Edit3' },
  { label: 'Phone / Contact', value: 'PhoneCall' },
  { label: 'Globe', value: 'Globe' },
  { label: 'Shield', value: 'Shield' },
  { label: 'Key', value: 'Key' },
];

export function PrivacyPolicyManager() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/privacy-policy');
      const data = await parseApiResponse<any>(res);
      setConfig(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load privacy policy content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await parseApiResponse<any>(res);
      setConfig(data);
      setSuccessMsg('Privacy Policy page updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving privacy policy');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, field: string, val: string) => {
    const updatedSections = [...config.sections];
    updatedSections[index][field] = val;
    setConfig({ ...config, sections: updatedSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.sections.length) return;
    const updatedSections = [...config.sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[targetIndex];
    updatedSections[targetIndex] = temp;
    // Re-index numbers
    updatedSections.forEach((sec, idx) => {
      sec.number = String(idx + 1);
    });
    setConfig({ ...config, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    const updatedSections = config.sections.filter((_: any, i: number) => i !== index);
    updatedSections.forEach((sec: any, idx: number) => {
      sec.number = String(idx + 1);
    });
    setConfig({ ...config, sections: updatedSections });
  };

  const addSection = () => {
    const newSec = {
      id: `sec_${Date.now()}`,
      number: String(config.sections.length + 1),
      icon: 'Shield',
      heading: 'New Policy Section',
      description: 'Describe the policy details for this section here.',
    };
    setConfig({ ...config, sections: [...config.sections, newSec] });
  };

  if (loading && !config) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading Privacy Policy settings...
      </div>
    );
  }

  if (!config) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Bar */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-600/10 text-pink-500 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">Privacy Policy Page Management</h3>
            <p className="text-xs text-stone-400">Manage the site-wide legal privacy policy structure, sections, and contact information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open('/privacy-policy', '_blank')}
            className="px-3.5 py-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-semibold transition"
          >
            Preview Page
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')}><span className="sr-only">Close</span>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')}><span className="sr-only">Close</span>✕</button>
        </div>
      )}

      {/* Header & Intro Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-pink-400">Page Header & Intro</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Page Title</label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-serif font-bold focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Introductory Paragraph</label>
            <textarea
              rows={3}
              value={config.intro || ''}
              onChange={(e) => setConfig({ ...config, intro: e.target.value })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 focus:outline-none focus:border-pink-500 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Sections Builder */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-pink-400">Policy Sections ({config.sections.length})</h4>
            <p className="text-xs text-stone-400">Add, reorder, or edit the numbered privacy policy sections displayed in the two-column layout</p>
          </div>
          <button
            type="button"
            onClick={addSection}
            className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-pink-500" /> Add Section
          </button>
        </div>

        <div className="space-y-4">
          {config.sections.map((section: any, index: number) => (
            <div key={section.id || index} className="bg-stone-950 border border-stone-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-600/20 text-pink-400 flex items-center justify-center font-mono text-xs font-bold">
                    {section.number || index + 1}
                  </span>
                  <span className="text-xs font-mono text-stone-400 uppercase">Section #{index + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 rounded text-xs transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === config.sections.length - 1}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 rounded text-xs transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-xs transition ml-2"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Section Heading</label>
                  <input
                    type="text"
                    value={section.heading || ''}
                    onChange={(e) => updateSection(index, 'heading', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-serif font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Section Icon</label>
                  <select
                    value={section.icon || 'Shield'}
                    onChange={(e) => updateSection(index, 'icon', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.value} value={ic.value}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Description / Content</label>
                  <textarea
                    rows={2}
                    value={section.description || ''}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-pink-500 font-sans"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Us Section Box */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
        <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider text-pink-400">Final Contact Section</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Contact Section Heading</label>
            <input
              type="text"
              value={config.contact?.heading || ''}
              onChange={(e) => setConfig({
                ...config,
                contact: { ...config.contact, heading: e.target.value }
              })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white font-serif font-bold focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Contact Email</label>
            <input
              type="email"
              value={config.contact?.email || ''}
              onChange={(e) => setConfig({
                ...config,
                contact: { ...config.contact, email: e.target.value }
              })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-pink-400 font-mono focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Contact Description</label>
            <input
              type="text"
              value={config.contact?.description || ''}
              onChange={(e) => setConfig({
                ...config,
                contact: { ...config.contact, description: e.target.value }
              })}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Privacy Policy Changes
        </button>
      </div>
    </form>
  );
}
