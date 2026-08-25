'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  RefreshCw,
  Check
} from 'lucide-react';
import { Notification } from '@/types';
import { parseApiResponse } from '@/lib/api';

export const NotificationsManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await parseApiResponse<any>(res);
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      await parseApiResponse<any>(res);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">System Notifications</h3>
            <p className="text-xs text-stone-400">Editorial milestones and system alert dispatch</p>
          </div>
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-400 rounded-lg text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs bg-stone-900 border border-stone-800 rounded-xl">
            {loading ? 'Fetching notification alerts...' : 'No notifications in your inbox.'}
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 bg-stone-900 border rounded-xl flex items-start justify-between gap-4 transition ${
                notif.isRead ? 'border-stone-800 opacity-75' : 'border-amber-400/40 bg-stone-850/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {notif.type === 'alert' || notif.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : notif.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-sm">{notif.title}</h4>
                  <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] font-mono text-stone-500 mt-2 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 bg-stone-800 hover:bg-emerald-600 hover:text-white text-stone-400 rounded transition"
                    title="Mark as Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white text-stone-400 rounded transition"
                  title="Dismiss"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
