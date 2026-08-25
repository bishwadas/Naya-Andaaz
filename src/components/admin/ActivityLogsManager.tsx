'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Shield,
  Clock,
  RefreshCw,
  UserCheck,
  FileEdit,
  Trash2,
  Lock
} from 'lucide-react';
import { ActivityLog } from '@/types';
import { parseApiResponse } from '@/lib/api';

export const ActivityLogsManager: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity-logs');
      const data = await parseApiResponse<any>(res);
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.targetTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">Security & Audit Activity Logs</h3>
            <p className="text-xs text-stone-400">Chronological ledger of all editorial actions and administrative logins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-400 rounded-lg text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="bg-stone-950 text-stone-400 text-xs uppercase font-mono border-b border-stone-800">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource Target</th>
                <th className="p-4">Target Title</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 text-xs">
                    {loading ? 'Retrieving audit trail...' : 'No activity records found.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-850/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={log.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.userName}`}
                          alt=""
                          className="w-7 h-7 rounded-full bg-stone-950 border border-stone-800"
                        />
                        <span className="font-serif font-bold text-white text-xs">{log.userName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                        log.action === 'publish' || log.action === 'create'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.action === 'delete'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono uppercase text-stone-400">
                      {log.targetType}
                    </td>
                    <td className="p-4 text-xs text-stone-200 max-w-xs truncate">
                      {log.targetTitle}
                    </td>
                    <td className="p-4 text-right text-xs font-mono text-stone-500">
                      {new Date(log.timestamp).toLocaleString()}
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
