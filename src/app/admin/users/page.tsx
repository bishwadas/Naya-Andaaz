'use client';

import React, { useState, useEffect } from 'react';
import { UsersManager } from '@/components/admin/UsersManager';
import { User } from '@/types';
import { parseApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const uRes = await fetch('/api/users').then((r) => parseApiResponse<any>(r));
      setUsers(Array.isArray(uRes) ? uRes : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
        <span className="text-xs font-mono">Loading user directory...</span>
      </div>
    );
  }

  return (
    <UsersManager
      initialUsers={users}
      initialMode="all"
      onUsersUpdated={fetchUsers}
    />
  );
}
