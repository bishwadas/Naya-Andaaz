'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { Newsletter } from '@/types';
import { parseApiResponse } from '@/lib/api';

export const NewsletterManager: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/newsletters');
      const data = await parseApiResponse<any>(res);
      setSubscribers(Array.isArray(data) ? data : data.subscribers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Unsubscribe and remove this subscriber?')) return;
    try {
      const res = await fetch(`/api/newsletters/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      setSuccessMsg('Subscriber removed');
      fetchSubscribers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Name,Status,SubscribedAt']
        .concat(subscribers.map((s) => `"${s.email}","${s.name || ''}","${s.status}","${s.subscribedAt}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sereia_newsletter_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">Newsletter Audience</h3>
            <p className="text-xs text-stone-400">{subscribers.length} total active subscribers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchSubscribers}
            className="p-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-400 rounded-lg text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950 text-stone-400 text-xs uppercase font-mono border-b border-stone-800">
              <tr>
                <th className="p-4">Subscriber Email</th>
                <th className="p-4">Name / Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Subscribed</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 text-xs">
                    {loading ? 'Fetching subscribers...' : 'No subscribers recorded yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-850/50 transition">
                    <td className="p-4 font-mono text-xs text-white">{s.email}</td>
                    <td className="p-4 text-xs text-stone-400">{s.name || s.source || 'Website Footer'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        s.status === 'subscribed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-stone-500 font-mono">
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white rounded text-stone-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
