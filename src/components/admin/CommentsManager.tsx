'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  X
} from 'lucide-react';
import { Comment } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface CommentsManagerProps {
  initialComments: Comment[];
  onCommentsUpdated: () => void;
}

export const CommentsManager: React.FC<CommentsManagerProps> = ({
  initialComments,
  onCommentsUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await parseApiResponse<any>(res);
      setSuccessMsg(`Comment marked as ${newStatus}`);
      onCommentsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      setSuccessMsg('Comment removed permanently');
      onCommentsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredComments = initialComments.filter((c) => {
    const matchesSearch =
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-white text-base">
            Community Comments ({initialComments.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Moderation States</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="spam">Spam</option>
            <option value="trash">Trash</option>
          </select>
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
            <CheckCircle className="w-4 h-4 text-emerald-400" />
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
                <th className="p-4">Author</th>
                <th className="p-4">Comment Content</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 text-xs">
                    No comments found in this queue.
                  </td>
                </tr>
              ) : (
                filteredComments.map((com) => (
                  <tr key={com.id} className="hover:bg-stone-850/50 transition">
                    <td className="p-4">
                      <div className="font-serif font-bold text-white text-xs">{com.authorName}</div>
                      <div className="text-[11px] font-mono text-stone-500">{com.authorEmail}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-xs text-stone-200 line-clamp-3 leading-relaxed">{com.content}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        com.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : com.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {com.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-stone-500 font-mono">
                      {new Date(com.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {com.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(com.id, 'approved')}
                          className="p-1.5 bg-emerald-950 hover:bg-emerald-800 text-emerald-300 rounded transition"
                          title="Approve Comment"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {com.status !== 'spam' && (
                        <button
                          onClick={() => handleUpdateStatus(com.id, 'spam')}
                          className="p-1.5 bg-amber-950 hover:bg-amber-800 text-amber-300 rounded transition"
                          title="Mark as Spam"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(com.id)}
                        className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white rounded text-stone-400 transition"
                        title="Delete Permanently"
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
