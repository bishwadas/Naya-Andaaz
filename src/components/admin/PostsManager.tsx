'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sparkles,
  Tag as TagIcon,
  Check,
  Calendar,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Post, Category, Tag, User, PostStatus } from '@/types';
import { parseApiResponse } from '@/lib/api';

interface PostsManagerProps {
  initialPosts: Post[];
  categories: Category[];
  users: User[];
  initialMode?: 'all' | 'add' | 'tags';
  onPostsUpdated: () => void;
}

export const PostsManager: React.FC<PostsManagerProps> = ({
  initialPosts,
  categories,
  users,
  initialMode = 'all',
  onPostsUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'edit' | 'tags'>(
    initialMode === 'add' ? 'edit' : initialMode === 'tags' ? 'tags' : 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageCaption, setFeaturedImageCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<PostStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [authorId, setAuthorId] = useState(users[0]?.id || '');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tag manager states
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [tagLoading, setTagLoading] = useState(false);

  const startCreate = () => {
    window.location.href = '/admin/posts/new';
  };

  const startEdit = (post: Post) => {
    window.location.href = `/admin/posts/${post.id}/edit`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setSeoTitle(val);
    }
  };

  const handleAiDraft = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a headline or title first to prompt AI generator.');
      return;
    }
    setIsAiGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a high quality journalistic article about: ${title}. Provide an engaging introductory paragraph, 3 comprehensive subheadings with analysis, and a concluding summary. Also generate a short 2-sentence summary/excerpt.`,
        }),
      });
      const data = await parseApiResponse<any>(res);
      if (data.content || data.text) {
        const text = data.content || data.text;
        setContent(text);
        if (!excerpt) {
          setExcerpt(text.slice(0, 200) + '...');
        }
        setSuccessMsg('AI draft generated successfully');
      } else {
        throw new Error(data.error || 'AI generation returned empty');
      }
    } catch (err: any) {
      setErrorMsg('AI generation failed: ' + (err.message || 'Check server configuration'));
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMsg('Title and slug are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 160),
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      featuredImageCaption,
      categoryId: categoryId || categories[0]?.id,
      status,
      isFeatured,
      isTrending,
      isEditorPick,
      authorId: authorId || users[0]?.id,
      seoTitle: seoTitle || title,
      metaDescription: metaDescription || excerpt,
      focusKeyword,
      tagNames: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await parseApiResponse<any>(res);

      setSuccessMsg(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      onPostsUpdated();
      setTimeout(() => {
        setViewMode('all');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      await parseApiResponse<any>(res);
      onPostsUpdated();
    } catch (err: any) {
      alert(err.message || 'Delete error');
    }
  };

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [initialPosts, searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Action / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'all' ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> All Posts ({initialPosts.length})
          </button>
          <button
            onClick={startCreate}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'edit' && !editingPost ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Post
          </button>
          <button
            onClick={() => setViewMode('tags')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'tags' ? 'bg-amber-400 text-stone-950 shadow-sm' : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" /> Tags
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search articles..."
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
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="trash">Trash</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* VIEW: All Posts Table */}
      {viewMode === 'all' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead className="bg-stone-950 text-stone-400 text-xs uppercase font-mono border-b border-stone-800">
                <tr>
                  <th className="p-4">Post Title & Slug</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500 text-xs">
                      No posts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-stone-850/50 transition">
                      <td className="p-4 max-w-md">
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-12 h-10 object-cover rounded bg-stone-950 shrink-0 border border-stone-800"
                            />
                          )}
                          <div>
                            <div className="font-serif font-bold text-white hover:text-amber-400 transition cursor-pointer" onClick={() => startEdit(post)}>
                              {post.title}
                            </div>
                            <div className="text-[11px] font-mono text-stone-500 truncate mt-0.5">
                              /{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                          {post.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-400">
                        {post.author?.name || 'Editorial Team'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-mono ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : post.status === 'draft'
                            ? 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs space-x-1">
                        {post.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px] font-bold">Featured</span>
                        )}
                        {post.isTrending && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-400/10 text-rose-400 text-[10px] font-bold">Trending</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-stone-500 font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => startEdit(post)}
                          className="p-1.5 bg-stone-800 hover:bg-amber-400 hover:text-stone-950 rounded text-stone-300 transition"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
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

      {/* VIEW: Post Editor Form */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between bg-stone-900 border border-stone-800 p-4 rounded-xl">
            <h3 className="font-serif font-bold text-white text-lg">
              {editingPost ? 'Edit Editorial Article' : 'Compose New Article'}
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
                {editingPost ? 'Update Article' : 'Publish Article'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Title & Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter an authoritative headline..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-white font-serif font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Permanent Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-slug-url"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="block text-xs font-mono uppercase text-stone-400">Article Content (Markdown / HTML)</label>
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={isAiGenerating}
                    className="px-2.5 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    {isAiGenerating ? 'AI Generating...' : 'Generate with AI'}
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Draft full body copy..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 font-sans leading-relaxed focus:outline-none focus:border-amber-400"
                />

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Excerpt / Summary</label>
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence lead overview..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* SEO Box */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
                <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2">
                  Search Engine Optimization (SEO)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-400 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-stone-400 mb-1">Focus Keyword</label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-stone-400 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Taxonomy & Publishing Meta */}
            <div className="space-y-6">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
                <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2">
                  Publishing Settings
                </h4>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PostStatus)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="trash">Trash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Primary Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Author</label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 space-y-2 border-t border-stone-800">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    Featured Hero Article
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    Trending in Ticker
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditorPick}
                      onChange={(e) => setIsEditorPick(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    Editor's Selection
                  </label>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
                <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2">
                  Featured Graphic
                </h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                {featuredImage && (
                  <div className="rounded-lg overflow-hidden border border-stone-800 aspect-video bg-stone-950">
                    <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">Caption / Credits</label>
                  <input
                    type="text"
                    value={featuredImageCaption}
                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                    placeholder="Photo credits..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
                <h4 className="font-serif font-bold text-white text-sm border-b border-stone-800 pb-2">
                  Tags Taxonomy
                </h4>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Comma-separated tags</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Politics, Economy, Technology..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* VIEW: Tags Manager */}
      {viewMode === 'tags' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-stone-800 pb-4">
            <h3 className="font-serif font-bold text-white text-lg">Article Tags Index</h3>
            <p className="text-xs text-stone-400">Manage classification keywords used for topic clustering across posts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-sm">Add New Keyword Tag</h4>
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Tag Name</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setNewTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Tag Slug</label>
                <input
                  type="text"
                  value={newTagSlug}
                  onChange={(e) => setNewTagSlug(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                disabled={tagLoading || !newTagName.trim()}
                onClick={async () => {
                  setTagLoading(true);
                  try {
                    const res = await fetch('/api/tags', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newTagName, slug: newTagSlug }),
                    });
                    if (res.ok) {
                      setNewTagName('');
                      setNewTagSlug('');
                      onPostsUpdated();
                    }
                  } finally {
                    setTagLoading(false);
                  }
                }}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition"
              >
                Add Tag
              </button>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-serif font-bold text-white text-sm">Quick Overview</h4>
              <p className="text-xs text-stone-400">
                Tags can be added directly when writing articles and will be indexed automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
