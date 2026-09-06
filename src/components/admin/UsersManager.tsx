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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFDFC] border border-[#E5E0DA] p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'all' ? 'bg-[#EC008C] text-white shadow-xs' : 'bg-[#F3F0EC] text-[#6B625C] hover:text-[#171717]'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" /> All Users ({initialUsers.length})
          </button>
          <button
            onClick={startCreate}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'edit' && !editingUser ? 'bg-[#EC008C] text-white shadow-xs' : 'bg-[#F3F0EC] text-[#6B625C] hover:text-[#171717]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add New User
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A817A]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#DDD6D0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder-[#8A817A] focus:outline-none focus:border-[#EC008C]"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800"><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* User Table */}
      {viewMode === 'all' && (
        <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#171717]">
              <thead className="bg-[#F7F5F2] text-[#6B625C] text-xs uppercase font-mono border-b border-[#E5E0DA]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0DA]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#8A817A] text-xs">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F7F5F2]/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt=""
                            className="w-9 h-9 rounded-full bg-[#F7F5F2] border border-[#E5E0DA] object-cover shrink-0"
                          />
                          <div>
                            <div className="font-serif font-bold text-[#171717] cursor-pointer hover:text-[#EC008C]" onClick={() => startEdit(u)}>
                              {u.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#6B625C]">@{u.username || 'user'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-[#6B625C]">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-pink-50 text-[#EC008C] border border-pink-200 text-[10px] uppercase font-bold font-mono">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[#6B625C] font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 bg-[#F3F0EC] hover:bg-[#EC008C] hover:text-white rounded text-[#171717] transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 bg-[#F3F0EC] hover:bg-rose-600 hover:text-white rounded text-[#6B625C] transition cursor-pointer"
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
        <form onSubmit={handleSubmit} className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4">
            <h3 className="font-serif font-bold text-[#171717] text-lg">
              {editingUser ? 'Edit User Credentials & Role' : 'Create User Account'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className="px-3 py-1.5 bg-[#F3F0EC] hover:bg-[#E5E0DA] text-[#171717] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-[#EC008C] hover:bg-pink-600 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C] font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#EC008C] font-mono focus:outline-none focus:border-[#EC008C]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">
                {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Role Permission (RBAC)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              >
                <option value="ADMIN">ADMIN (Full Permissions)</option>
                <option value="EDITOR">EDITOR (Manage Content & Taxonomy)</option>
                <option value="AUTHOR">AUTHOR (Write & Edit Own Posts)</option>
                <option value="SUBSCRIBER">SUBSCRIBER (Read & Comment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-[#6B625C] mb-1">Bio / Author Description</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white border border-[#DDD6D0] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#EC008C]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="userActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-[#EC008C] rounded"
              />
              <label htmlFor="userActive" className="text-xs text-[#171717] uppercase font-mono">
                Account is Active and Allowed to Login
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
