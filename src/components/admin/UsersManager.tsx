'use client';

import React, { useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Shield,
  Check,
  Key
} from 'lucide-react';
import { User, Role } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface UsersManagerProps {
  initialUsers: User[];
  initialMode?: 'all' | 'add';
  onUsersUpdated: () => void;
}

export const UsersManager: React.FC<UsersManagerProps> = ({
  initialUsers,
  initialMode = 'all',
  onUsersUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'edit'>(initialMode === 'add' ? 'edit' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('AUTHOR');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const startCreate = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('AUTHOR');
    setAvatar('');
    setBio('');
    setIsActive(true);
    setErrorMsg('');
    setSuccessMsg('');
    setViewMode('edit');
  };

  const startEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name || '');
    setUsername(u.username || '');
    setEmail(u.email || '');
    setPassword('');
    setRole(u.role);
    setAvatar(u.avatar || '');
    setBio(u.bio || '');
    setIsActive(u.isActive);
    setErrorMsg('');
    setSuccessMsg('');
    setViewMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required');
      return;
    }
    if (!editingUser && !password.trim()) {
      setErrorMsg('Password is required for new accounts');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const payload: any = {
        name,
        username: username || email.split('@')[0],
        email,
        role: role.toUpperCase(),
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        bio,
        isActive,
      };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await parseApiResponse<any>(res);

      setSuccessMsg(editingUser ? 'User profile updated!' : 'New user created successfully!');
      onUsersUpdated();
      setTimeout(() => setViewMode('all'), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      onUsersUpdated();
    } catch (err: any) {
      alert(err.message || 'Delete error');
    }
  };

  const filteredUsers = initialUsers.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'all' ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" /> All Users ({initialUsers.length})
          </button>
          <button
            onClick={startCreate}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'edit' && !editingUser ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add New User
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
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

      {/* User Table */}
      {viewMode === 'all' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-xs uppercase font-mono border-b border-stone-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500 text-xs">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-850/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt=""
                            className="w-9 h-9 rounded-full bg-stone-950 border border-stone-800 object-cover shrink-0"
                          />
                          <div>
                            <div className="font-serif font-bold text-white cursor-pointer hover:text-amber-400" onClick={() => startEdit(u)}>
                              {u.name}
                            </div>
                            <div className="text-[11px] font-mono text-stone-500">@{u.username || 'user'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-stone-400">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] uppercase font-bold font-mono">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-500 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 rounded text-stone-300 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 bg-stone-800 hover:bg-rose-600 hover:text-white rounded text-stone-400 transition"
                          title="Delete"
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
      )}

      {/* User Edit Form */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <h3 className="font-serif font-bold text-white text-lg">
              {editingUser ? 'Edit User Credentials & Role' : 'Create User Account'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
                {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Role Permission (RBAC)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ADMIN">ADMIN (Full Permissions)</option>
                <option value="EDITOR">EDITOR (Manage Content & Taxonomy)</option>
                <option value="AUTHOR">AUTHOR (Write & Edit Own Posts)</option>
                <option value="SUBSCRIBER">SUBSCRIBER (Read & Comment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Bio / Author Description</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="userActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <label htmlFor="userActive" className="text-xs text-white uppercase font-mono">
                Account is Active and Allowed to Login
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
