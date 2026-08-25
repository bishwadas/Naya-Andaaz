'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Save,
  Eye,
  Send,
  ArrowLeft,
  Settings,
  Type,
  Image as ImageIcon,
  Grid,
  Quote,
  List,
  ListOrdered,
  Minus,
  Video,
  Youtube,
  Link as LinkIcon,
  Check,
  Loader2,
  Edit,
  Code,
  Columns,
  Sparkles,
  HelpCircle,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { Block, serializeBlocksToHtml, parseHtmlToBlocks, sanitizeHtml } from '@/lib/blocks';
import { Post, Category, Tag, User } from '@/types';

interface PostEditorProps {
  initialPost?: Post | null;
  categories: Category[];
  tags: Tag[];
  users: User[];
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
  backUrl?: string;
}

function FaqBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const items = block.items || block.attrs?.items || [];

  const handleItemChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    block.items = updatedItems;
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  const handleAddItem = () => {
    const updatedItems = [...items, { question: '', answer: '' }];
    block.items = updatedItems;
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    block.items = updatedItems;
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[targetIdx];
    updatedItems[targetIdx] = temp;
    block.items = updatedItems;
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border border-pink-600 text-pink-600 flex items-center justify-center shrink-0 text-xs font-bold">
            ?
          </div>
          <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
            FAQ Management ({items.length} Questions)
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
        >
          <span>+ Add Question</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`faq-editor-${index}`}
            className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold font-mono text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                #{index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveItem(index, 'up')}
                  className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 transition"
                  title="Move Up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveItem(index, 'down')}
                  className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 transition"
                  title="Move Down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:bg-rose-50 rounded text-rose-600 transition ml-1"
                  title="Delete Question"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Question {index + 1}
              </label>
              <input
                type="text"
                placeholder="e.g. Where is Jampui Hills located?"
                value={item.question}
                onChange={(e) => handleItemChange(index, 'question', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-xs font-serif font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Answer {index + 1}
              </label>
              <textarea
                rows={2}
                placeholder="Enter detailed answer here..."
                value={item.answer}
                onChange={(e) => handleItemChange(index, 'answer', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 transition"
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-6 text-stone-400 text-xs">
            No questions added yet. Click "+ Add Question" to create your first FAQ item.
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 bg-white border border-dashed border-stone-300 hover:border-pink-500 hover:bg-pink-50/30 text-stone-700 hover:text-pink-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <span>+ Add Question</span>
        </button>
      </div>
    </div>
  );
}

function AlsoReadBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const selectedPostId = block.postId || block.attrs?.postId;

  useEffect(() => {
    if (selectedPostId && (!selectedPost || selectedPost.id !== selectedPostId)) {
      fetch(`/api/posts/${selectedPostId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSelectedPost(data);
          }
        })
        .catch(() => {});
    }
  }, [selectedPostId]);

  useEffect(() => {
    if (!isSearching) return;
    setLoading(true);
    const url = searchQuery.trim()
      ? `/api/posts?search=${encodeURIComponent(searchQuery)}&status=published&limit=10`
      : `/api/posts?status=published&limit=10`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.posts || [];
        setPosts(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, isSearching]);

  const handleSelectPost = (p: Post) => {
    setSelectedPost(p);
    block.postId = p.id;
    updateBlockAttrs(block.id, { postId: p.id });
    setIsSearching(false);
  };

  const handleRemove = () => {
    setSelectedPost(null);
    block.postId = '';
    updateBlockAttrs(block.id, { postId: '' });
  };

  if (selectedPostId && selectedPost && !isSearching) {
    const postCat = selectedPost.subCategory || selectedPost.category;
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3.5 min-w-0">
          {selectedPost.featuredImage ? (
            <img
              src={selectedPost.featuredImage}
              alt=""
              className="w-20 h-14 object-cover rounded-lg shrink-0 border border-stone-100"
            />
          ) : (
            <div className="w-20 h-14 bg-stone-100 rounded-lg shrink-0 flex items-center justify-center text-stone-400 text-xs">
              No Image
            </div>
          )}
          <div className="min-w-0">
            {postCat && (
              <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider block mb-0.5 truncate">
                {postCat.name}
              </span>
            )}
            <h4 className="font-serif font-bold text-stone-900 text-sm truncate">
              {selectedPost.title}
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">ID: {selectedPost.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsSearching(true);
              setSearchQuery('');
            }}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-pink-600" /> Select "Also Read" Article
        </span>
        {selectedPostId && (
          <button
            type="button"
            onClick={() => setIsSearching(false)}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Cancel
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search published articles by title..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsSearching(true);
        }}
        onFocus={() => setIsSearching(true)}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
      />

      {loading && (
        <div className="text-center py-3 text-xs text-stone-500">Searching articles...</div>
      )}

      {!loading && posts.length > 0 && (
        <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-stone-100 bg-white border border-stone-200 rounded-lg p-2">
          {posts.map((p) => {
            const cat = p.subCategory || p.category;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPost(p)}
                className="pt-2 pb-2 px-2 hover:bg-pink-50/60 rounded-md cursor-pointer transition flex items-center gap-3 first:pt-0 last:pb-0"
              >
                {p.featuredImage ? (
                  <img src={p.featuredImage} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-12 h-9 bg-stone-100 rounded shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {cat && (
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block truncate">
                      {cat.name}
                    </span>
                  )}
                  <p className="text-xs font-serif font-bold text-stone-900 truncate">{p.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && isSearching && posts.length === 0 && (
        <div className="text-center py-4 text-xs text-stone-400">No articles found matching "{searchQuery}"</div>
      )}
    </div>
  );
}

export function PostEditor({
  initialPost = null,
  categories = [],
  tags = [],
  users = [],
  role = 'ADMIN',
  backUrl,
}: PostEditorProps) {
  const router = useRouter();
  const isAuthor = role === 'AUTHOR';
  const defaultBack = backUrl || (isAuthor ? '/author/posts/all-posts' : role === 'EDITOR' ? '/editor/posts' : '/admin/posts');

  // 1. Post State
  const [postId, setPostId] = useState<string>(initialPost?.id || '');
  const [title, setTitle] = useState<string>(initialPost?.title || '');
  const [slug, setSlug] = useState<string>(initialPost?.slug || '');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [excerpt, setExcerpt] = useState<string>(initialPost?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState<string>(
    initialPost?.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80'
  );
  const [featuredImageCaption, setFeaturedImageCaption] = useState<string>(initialPost?.featuredImageCaption || '');
  const [categoryId, setCategoryId] = useState<string>(initialPost?.categoryId || categories[0]?.id || '');
  const [subCategoryId, setSubCategoryId] = useState<string>(initialPost?.subCategoryId || 'none');
  const [status, setStatus] = useState<string>(initialPost?.status || 'draft');
  
  // Flag states
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialPost?.isFeatured));
  const [isTrending, setIsTrending] = useState<boolean>(Boolean(initialPost?.isTrending));
  const [isEditorPick, setIsEditorPick] = useState<boolean>(Boolean(initialPost?.isEditorPick));
  const [allowComments, setAllowComments] = useState<boolean>(initialPost?.allowComments !== false);
  
  // Author state
  const [authorId, setAuthorId] = useState<string>(initialPost?.authorId || users[0]?.id || '');

  // SEO states
  const [seoTitle, setSeoTitle] = useState<string>(initialPost?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState<string>(initialPost?.metaDescription || '');
  const [focusKeyword, setFocusKeyword] = useState<string>(initialPost?.focusKeyword || '');
  const [canonicalUrl, setCanonicalUrl] = useState<string>(initialPost?.canonicalUrl || '');
  const [ogImage, setOgImage] = useState<string>(initialPost?.ogImage || '');

  const [publishedAtLocal, setPublishedAtLocal] = useState<string>(
    initialPost?.publishedAt 
      ? new Date(new Date(initialPost.publishedAt).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16) 
      : ''
  );

  // Tag Input states
  const [tagChips, setTagChips] = useState<string[]>(
    initialPost?.tags?.map((t: any) => t.name) || []
  );
  const [tagInputValue, setTagInputValue] = useState<string>('');

  // 2. Editor UI Mode
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'Saving...' | 'Saved' | 'Unsaved Changes' | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Active picker state for blocks
  const [activePicker, setActivePicker] = useState<{ type: 'inline' | 'end'; index?: number } | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sereia-picker-container') && !target.closest('.sereia-picker-trigger')) {
        setActivePicker(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePicker(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 3. Load Blocks
  useEffect(() => {
    if (initialPost) {
      if (initialPost.blocks && Array.isArray(initialPost.blocks) && initialPost.blocks.length > 0) {
        setBlocks(initialPost.blocks);
      } else if (initialPost.content) {
        // Fallback: Parse existing HTML/text post content into Gutenberg blocks
        setBlocks(parseHtmlToBlocks(initialPost.content));
      } else {
        // New empty block
        setBlocks([{ id: 'p_init', type: 'paragraph', content: '' }]);
      }
    } else {
      // New Post default block
      setBlocks([{ id: 'p_init', type: 'paragraph', content: '' }]);
    }
  }, [initialPost]);

  // Sync title with Slug if editing a new post
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setSeoTitle(val);
    }
  };

  // Convert visual blocks to raw HTML when switching modes
  useEffect(() => {
    if (editMode === 'html') {
      setHtmlContent(serializeBlocksToHtml(blocks));
    }
  }, [editMode, blocks]);

  // Save changes from HTML mode back to blocks when returning to Visual mode
  const handleSwitchToVisual = () => {
    const parsed = parseHtmlToBlocks(htmlContent);
    setBlocks(parsed.length > 0 ? parsed : [{ id: `p_${Date.now()}`, type: 'paragraph', content: htmlContent }]);
    setEditMode('visual');
  };

  // Helper: Add block
  const addBlock = (
    type: Block['type'],
    index?: number,
    initialContent: string = ''
  ) => {
    const newBlock: Block = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: initialContent,
      attrs: getDefaultForType(type),
    };
    const updated = [...blocks];
    if (index !== undefined) {
      updated.splice(index + 1, 0, newBlock);
    } else {
      updated.push(newBlock);
    }
    setBlocks(updated);
    setSaveStatus('Unsaved Changes');
    setActivePicker(null);
  };

  const getDefaultForType = (type: Block['type']) => {
    switch (type) {
      case 'image':
        return { url: '', caption: '', alt: '' };
      case 'gallery':
        return { images: [] };
      case 'video':
        return { url: '' };
      case 'youtube':
        return { youtubeId: '', aspectRatio: '16-9' as const };
      case 'button':
        return { buttonText: 'Read More', buttonUrl: '#', buttonStyle: 'primary' as const, buttonAlign: 'center' as const };
      case 'columns':
        return {
          columns: [
            { id: 'col1', blocks: [{ id: 'col1_p1', type: 'paragraph' as const, content: '' }] },
            { id: 'col2', blocks: [{ id: 'col2_p1', type: 'paragraph' as const, content: '' }] },
          ],
        };
      case 'link':
        return { linkText: '', linkUrl: '' };
      case 'quote':
        return { author: '' };
      case 'table-of-contents':
        return {};
      case 'alsoRead':
        return { postId: '' };
      case 'faq':
        return {
          items: [
            { question: 'Where is Jampui Hills located?', answer: 'Jampui Hills is located in the Dhalai district of Tripura, India.' },
            { question: 'How do I reach Jampui Hills?', answer: 'You can reach Jampui Hills by...' },
          ],
        };
      default:
        return {};
    }
  };

  // Helper: Delete block
  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      // Don't leave it completely empty
      setBlocks([{ id: `p_${Date.now()}`, type: 'paragraph', content: '' }]);
      return;
    }
    setBlocks(blocks.filter((b) => b.id !== id));
    setSaveStatus('Unsaved Changes');
  };

  // Helper: Reorder block
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const updated = [...blocks];
    const temp = updated[index];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
    setSaveStatus('Unsaved Changes');
  };

  // Helper: Duplicate block
  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const clone: Block = {
      ...original,
      id: `${original.type}_clone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      attrs: original.attrs ? JSON.parse(JSON.stringify(original.attrs)) : undefined,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, clone);
    setBlocks(updated);
    setSaveStatus('Unsaved Changes');
  };

  // Helper: Edit block content
  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    setSaveStatus('Unsaved Changes');
  };

  // Helper: Edit block attributes
  const updateBlockAttrs = (id: string, attrs: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, attrs: { ...b.attrs, ...attrs } } : b)));
    setSaveStatus('Unsaved Changes');
  };

  // Helper: Change block type
  const changeBlockType = (id: string, type: Block['type']) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            type,
            attrs: getDefaultForType(type),
          };
        }
        return b;
      })
    );
    setSaveStatus('Unsaved Changes');
  };

  // 4. AUTOSAVE ENGINE
  useEffect(() => {
    if (!title.trim() && blocks.length <= 1 && blocks[0]?.content === '') return;

    const timer = setTimeout(() => {
      setSaveStatus('Saving...');
      // Store draft in LocalStorage for protection
      const autosaveData = {
        title,
        blocks,
        excerpt,
        featuredImage,
        featuredImageCaption,
        categoryId,
        subCategoryId,
        status,
        isFeatured,
        isTrending,
        isEditorPick,
        allowComments,
        authorId,
        seoTitle,
        metaDescription,
        focusKeyword,
        canonicalUrl,
        ogImage,
        tagChips,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`sereia_draft_${postId || 'new'}`, JSON.stringify(autosaveData));
      
      // Perform database autosave if the post already exists as a draft
      if (postId && status === 'draft') {
        const compiledHtml = serializeBlocksToHtml(blocks);
        fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            blocks,
            content: compiledHtml,
            excerpt: excerpt || compiledHtml.replace(/<[^>]+>/g, '').slice(0, 180),
            featuredImage,
            featuredImageCaption,
            categoryId,
            subCategoryId: subCategoryId === 'none' ? null : subCategoryId,
            status: 'draft',
            isFeatured,
            isTrending,
            isEditorPick,
            allowComments,
            authorId,
            seoTitle,
            metaDescription,
            focusKeyword,
            canonicalUrl,
            ogImage,
            tags: tagChips.join(', ')
          })
        })
        .then(() => setSaveStatus('Saved'))
        .catch(() => setSaveStatus('Unsaved Changes'));
      } else {
        setSaveStatus('Saved');
      }
    }, 4000); // Debounce database/local writes by 4 seconds

    return () => clearTimeout(timer);
  }, [
    title,
    blocks,
    excerpt,
    featuredImage,
    featuredImageCaption,
    categoryId,
    subCategoryId,
    isFeatured,
    isTrending,
    isEditorPick,
    allowComments,
    authorId,
    seoTitle,
    metaDescription,
    focusKeyword,
    canonicalUrl,
    ogImage,
    tagChips
  ]);

  // Load local draft backup if available
  useEffect(() => {
    const localDraftStr = localStorage.getItem(`sereia_draft_${postId || 'new'}`);
    if (localDraftStr) {
      try {
        const localDraft = JSON.parse(localDraftStr);
        // Only load if the backup is fresher or we are composing a new article
        if (!initialPost || new Date(localDraft.updatedAt) > new Date(initialPost.updatedAt)) {
          if (confirm("We found a more recent autosaved version of this article. Would you like to restore it?")) {
            setTitle(localDraft.title || '');
            setBlocks(localDraft.blocks || []);
            setExcerpt(localDraft.excerpt || '');
            setFeaturedImage(localDraft.featuredImage || '');
            setFeaturedImageCaption(localDraft.featuredImageCaption || '');
            setCategoryId(localDraft.categoryId || '');
            setSubCategoryId(localDraft.subCategoryId || 'none');
            setIsFeatured(Boolean(localDraft.isFeatured));
            setIsTrending(Boolean(localDraft.isTrending));
            setIsEditorPick(Boolean(localDraft.isEditorPick));
            setAllowComments(localDraft.allowComments !== false);
            setAuthorId(localDraft.authorId || '');
            setSeoTitle(localDraft.seoTitle || '');
            setMetaDescription(localDraft.metaDescription || '');
            setFocusKeyword(localDraft.focusKeyword || '');
            setCanonicalUrl(localDraft.canonicalUrl || '');
            setOgImage(localDraft.ogImage || '');
            const parsedTags = localDraft.tagChips || (localDraft.tagInput ? localDraft.tagInput.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
            setTagChips(parsedTags);
          }
        }
      } catch (_) {}
    }
  }, [initialPost, postId]);

  // 5. PUBLISH & SAVE ACTIONS
  const handleSavePost = async (targetStatus: string = status) => {
    if (!title.trim()) {
      setErrorMsg('An article title is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Switch to blocks serialisation
    const compiledContent = editMode === 'html' ? htmlContent : serializeBlocksToHtml(blocks);
    const finalBlocks = editMode === 'html' ? parseHtmlToBlocks(htmlContent) : blocks;
    const resolvedSlug =
      slug.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
      title: title.trim(),
      slug: resolvedSlug,
      content: compiledContent,
      blocks: finalBlocks,
      excerpt: excerpt.trim() || compiledContent.replace(/<[^>]+>/g, '').slice(0, 180),
      featuredImage,
      featuredImageCaption: featuredImageCaption.trim() || null,
      categoryId,
      subCategoryId: subCategoryId === 'none' ? null : subCategoryId,
      status: targetStatus,
      isFeatured,
      isTrending,
      isEditorPick,
      allowComments,
      authorId,
      seoTitle: seoTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim() || null,
      focusKeyword: focusKeyword.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      ogImage: ogImage.trim() || featuredImage,
      tags: tagChips.join(', '),
      ...(publishedAtLocal ? { publishedAt: new Date(publishedAtLocal + ':00+05:30').toISOString() } : {}),
    };

    try {
      const endpoint = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server responded with an error.');
      }

      setSuccessMsg(postId ? 'Article updated successfully!' : 'Article created and saved successfully!');
      setStatus(targetStatus);
      setSaveStatus('Saved');

      // If newly created, set ID and redirect to edit route
      if (!postId && resData.id) {
        setPostId(resData.id);
        localStorage.removeItem('sereia_draft_new');
        if (isAuthor) {
          router.replace(`/author/posts/${resData.id}`);
        } else if (role === 'EDITOR') {
          router.replace(`/editor/posts/${resData.id}`);
        } else {
          router.replace(`/admin/posts/${resData.id}/edit`);
        }
      } else {
        localStorage.removeItem(`sereia_draft_${postId}`);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to save article:', err);
      setErrorMsg(err.message || 'An error occurred while saving the post.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-100">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(defaultBack)}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 transition flex items-center justify-center"
            title="Go back to articles list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-[1px] bg-stone-200" />
          
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
              status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : status === 'pending'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}>
              {status === 'pending' ? 'In Review' : status}
            </span>
            {saveStatus && (
              <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                {saveStatus === 'Saving...' && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Editing mode toggles + primary actions */}
        <div className="flex items-center gap-2">
          {/* Visual/HTML Mode toggles */}
          <div className="bg-stone-100 p-0.5 rounded-lg flex items-center border border-stone-200 text-xs font-medium mr-2">
            <button
              onClick={() => editMode === 'html' && handleSwitchToVisual()}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                editMode === 'visual' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Visual
            </button>
            <button
              onClick={() => setEditMode('html')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                editMode === 'html' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> HTML
            </button>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2 hover:bg-stone-100 text-stone-700 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 border border-stone-200 bg-white"
          >
            <Eye className="w-3.5 h-3.5" /> {showPreview ? "Hide Preview" : "Preview"}
          </button>

          <button
            onClick={() => handleSavePost('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving && status === 'draft' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Draft
          </button>

          {isAuthor ? (
            <button
              onClick={() => handleSavePost('pending')}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSaving && status === 'pending' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {status === 'pending' ? 'Update Submission' : 'Submit for Review'}
            </button>
          ) : (
            <button
              onClick={() => handleSavePost('published')}
              disabled={isSaving}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSaving && status === 'published' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {status === 'published' ? 'Update Post' : 'Publish'}
            </button>
          )}

          <div className="h-6 w-[1px] bg-stone-200 mx-1" />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition flex items-center justify-center ${
              showSettings ? 'bg-amber-100 text-amber-700' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title="Toggle Post Settings Sidebar"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Alerts container */}
        <AnimatePresence>
          {(errorMsg || successMsg) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-full px-4">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm shadow-xl flex items-start gap-2.5"
                >
                  <Trash2 className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                  <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-700 text-xs font-bold">Dismiss</button>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-sm shadow-xl flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="flex-1 font-medium">{successMsg}</div>
                  <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-700 text-xs font-bold">Dismiss</button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* 2A. LEFT EDITOR SPACE OR PREVIEW VIEWPORT */}
        <div className="flex-1 overflow-y-auto bg-white px-6 py-12 md:px-12 flex justify-center">
          {showPreview ? (
            /* PREVIEW VIEWPORT */
            <div className="max-w-4xl w-full space-y-8 font-serif leading-relaxed text-stone-800">
              <div className="text-center py-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider mb-8 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Live Article Layout Preview
              </div>

              <div className="space-y-4">
                {categoryId && (
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                    {categories.find((c) => c.id === categoryId)?.name || 'General'}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-950 leading-tight">
                  {title || "Untitled Article"}
                </h1>
                {excerpt && (
                  <p className="text-lg sm:text-xl text-stone-600 leading-relaxed italic border-l-4 border-amber-400 pl-4">
                    {excerpt}
                  </p>
                )}
              </div>

              {featuredImage && (
                <figure className="my-10 rounded-2xl overflow-hidden bg-stone-100 shadow-md">
                  <img src={featuredImage} alt={title} className="w-full h-auto max-h-[500px] object-cover" />
                  {featuredImageCaption && (
                    <figcaption className="p-3 text-xs text-stone-500 bg-stone-100 italic text-center">
                      {featuredImageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* RENDER DYNAMIC VISUAL BLOCKS */}
              <article className="prose prose-stone prose-lg max-w-none text-stone-800 leading-relaxed space-y-6">
                {(editMode === 'html' ? parseHtmlToBlocks(htmlContent) : blocks).map((block) => (
                  <div key={block.id} className="sereia-block-rendered">
                    {block.type === 'paragraph' && (
                      <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
                        {block.content || <span className="text-stone-300 italic">Empty paragraph block</span>}
                      </p>
                    )}

                    {(block.type === 'heading-h2') && (
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4">
                        {block.content}
                      </h2>
                    )}

                    {(block.type === 'heading-h3') && (
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3">
                        {block.content}
                      </h3>
                    )}

                    {block.type === 'image' && (
                      <figure className="my-8 rounded-xl overflow-hidden bg-stone-50 border border-stone-200 p-1">
                        <img
                          src={block.attrs?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                          alt={block.attrs?.alt || ''}
                          className="w-full h-auto rounded"
                        />
                        {block.attrs?.caption && (
                          <figcaption className="text-center text-xs text-stone-500 italic mt-2">{block.attrs.caption}</figcaption>
                        )}
                      </figure>
                    )}

                    {block.type === 'gallery' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-8">
                        {(block.attrs?.images || []).map((img: any, i: number) => (
                          <figure key={i} className="rounded overflow-hidden border border-stone-200 bg-white shadow-sm p-1">
                            <img src={img.url} alt="" className="w-full h-24 object-cover rounded" />
                            {img.caption && <figcaption className="text-[10px] text-stone-500 italic text-center mt-1 truncate">{img.caption}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <blockquote className="border-l-4 border-amber-500 pl-4 py-1 italic text-lg text-stone-700 bg-stone-50 my-6 rounded-r">
                        <p className="mb-2">"{block.content || 'Words shape worlds.'}"</p>
                        {block.attrs?.author && (
                          <cite className="text-xs text-stone-500 not-italic block font-sans font-semibold">— {block.attrs.author}</cite>
                        )}
                      </blockquote>
                    )}

                    {block.type === 'list-bullet' && (
                      <ul className="list-disc pl-6 space-y-1.5 my-4">
                        {block.content.split('\n').filter(Boolean).map((li, idx) => (
                          <li key={idx} className="text-stone-800 font-serif">{li}</li>
                        ))}
                      </ul>
                    )}

                    {block.type === 'list-number' && (
                      <ol className="list-decimal pl-6 space-y-1.5 my-4">
                        {block.content.split('\n').filter(Boolean).map((li, idx) => (
                          <li key={idx} className="text-stone-800 font-serif">{li}</li>
                        ))}
                      </ol>
                    )}

                    {block.type === 'divider' && (
                      <hr className="my-8 border-t border-stone-200" />
                    )}

                    {block.type === 'video' && (
                      <div className="rounded-xl overflow-hidden shadow border border-stone-200 my-8">
                        <video controls src={block.attrs?.url} className="w-full h-auto max-h-[400px]" />
                      </div>
                    )}

                    {block.type === 'youtube' && block.attrs?.youtubeId && (
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow border border-stone-200 my-8">
                        <iframe
                          src={`https://www.youtube.com/embed/${block.attrs.youtubeId}`}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {block.type === 'link' && (
                      <p className="font-serif">
                        <a href={block.attrs?.linkUrl || '#'} className="text-amber-600 hover:underline hover:text-amber-700 font-medium">
                          {block.attrs?.linkText || block.content || 'Link'}
                        </a>
                      </p>
                    )}

                    {block.type === 'button' && (
                      <div className={`my-6 flex justify-${block.attrs?.buttonAlign === 'center' ? 'center' : block.attrs?.buttonAlign === 'right' ? 'end' : 'start'}`}>
                        <a
                          href={block.attrs?.buttonUrl || '#'}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition tracking-wide ${
                            block.attrs?.buttonStyle === 'outline'
                              ? 'border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white'
                              : block.attrs?.buttonStyle === 'secondary'
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                              : 'bg-pink-600 hover:bg-pink-700 text-white shadow hover:shadow-md'
                          }`}
                        >
                          {block.attrs?.buttonText || block.content || 'Button'}
                        </a>
                      </div>
                    )}

                    {block.type === 'columns' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        {(block.attrs?.columns || []).map((col: any, ci: number) => (
                          <div key={ci} className="space-y-4">
                            {col.blocks.map((sub: Block) => (
                              <div key={sub.id} className="text-base text-stone-800 leading-relaxed font-serif">
                                {sub.type === 'paragraph' && <p>{sub.content}</p>}
                                {sub.type === 'heading-h2' && <h2 className="text-xl font-bold font-serif mt-4">{sub.content}</h2>}
                                {sub.type === 'heading-h3' && <h3 className="text-lg font-bold font-serif mt-3">{sub.content}</h3>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === 'faq' && (
                      <div className="my-6 p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-pink-600 text-pink-600 flex items-center justify-center shrink-0 font-bold text-xs">
                            ?
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-stone-900 text-base">Frequently Asked Questions</h4>
                            <div className="w-8 h-0.5 bg-pink-600 mt-1"></div>
                          </div>
                        </div>
                        <div className="space-y-2 pt-1">
                          {(block.items || block.attrs?.items || []).map((item: any, fi: number) => (
                            <div key={fi} className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs font-serif font-bold text-stone-900">
                              <span>{fi + 1}. {item.question || 'Untitled Question'}</span>
                              <span className="text-pink-600 text-[10px] bg-pink-50 px-2 py-0.5 rounded-full font-sans uppercase">FAQ Item</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'html' && (
                      <div className="my-6 p-4 bg-stone-50 border border-stone-200 rounded-xl" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} />
                    )}
                  </div>
                ))}
              </article>
            </div>
          ) : editMode === 'html' ? (
            /* RAW HTML MODE */
            <div className="max-w-4xl w-full flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 bg-stone-100 px-4 py-2 border border-stone-200 rounded-lg shrink-0">
                <span className="font-mono">ARTICLE_HTML_SOURCE_CODE</span>
                <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" /> Full HTML Access</span>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="flex-1 w-full p-6 bg-stone-950 text-amber-100 font-mono text-sm leading-relaxed rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner border border-stone-800 min-h-[500px]"
                placeholder="Write custom article HTML here..."
              />
            </div>
          ) : (
            /* BLOCK-BASED VISUAL EDITOR */
            <div className="max-w-3xl w-full space-y-6">
              {/* Centered spacious Article Title input */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <input
                  type="text"
                  placeholder="Add Title"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full text-3xl sm:text-4xl font-serif font-extrabold text-stone-950 placeholder-stone-300 focus:outline-none leading-tight border-0 bg-transparent px-0"
                />
              </div>

              {/* BLOCKS INTERFACE */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative group border border-stone-100 hover:border-amber-200 rounded-xl bg-white hover:shadow-sm transition duration-200 p-4"
                    >
                      {/* INLINE CONTROLS (FLOAT TRIGGERED ON HOVER) */}
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col items-center bg-white border border-stone-200 shadow-md rounded-lg p-0.5 z-20">
                        <button
                          onClick={() => moveBlock(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-stone-100 text-stone-500 hover:text-stone-950 rounded transition disabled:opacity-30"
                          title="Move block up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveBlock(index, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-1 hover:bg-stone-100 text-stone-500 hover:text-stone-950 rounded transition disabled:opacity-30"
                          title="Move block down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateBlock(index)}
                          className="p-1 hover:bg-stone-100 text-stone-500 hover:text-stone-950 rounded transition"
                          title="Duplicate block"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded transition"
                          title="Delete block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* BLOCK CONTAINER */}
                      <div className="space-y-3">
                        {/* Block type identity header */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono border-b border-stone-50 pb-2">
                          <span className="flex items-center gap-1.5">
                            {block.type === 'paragraph' && <Type className="w-3 h-3 text-stone-500" />}
                            {block.type === 'heading-h2' && <span className="text-stone-700">H2</span>}
                            {block.type === 'heading-h3' && <span className="text-stone-700">H3</span>}
                            {block.type === 'image' && <ImageIcon className="w-3 h-3 text-stone-500" />}
                            {block.type === 'gallery' && <Grid className="w-3 h-3 text-stone-500" />}
                            {block.type === 'quote' && <Quote className="w-3 h-3 text-stone-500" />}
                            {block.type === 'list-bullet' && <List className="w-3 h-3 text-stone-500" />}
                            {block.type === 'list-number' && <ListOrdered className="w-3 h-3 text-stone-500" />}
                            {block.type === 'divider' && <Minus className="w-3 h-3 text-stone-500" />}
                            {block.type === 'video' && <Video className="w-3 h-3 text-stone-500" />}
                            {block.type === 'youtube' && <Youtube className="w-3 h-3 text-stone-500" />}
                            {block.type === 'link' && <LinkIcon className="w-3 h-3 text-stone-500" />}
                            {block.type === 'button' && <Sparkles className="w-3 h-3 text-stone-500" />}
                            {block.type === 'columns' && <Columns className="w-3 h-3 text-stone-500" />}
                            {block.type === 'table-of-contents' && <BookOpen className="w-3 h-3 text-stone-500" />}
                            {block.type === 'alsoRead' && <BookOpen className="w-3 h-3 text-pink-600" />}
                            {block.type === 'faq' && <HelpCircle className="w-3 h-3 text-pink-600" />}
                            {block.type === 'html' && <Code className="w-3 h-3 text-stone-500" />}
                            {block.type}
                          </span>
                          
                          {/* Convert type inline selector */}
                          <select
                            value={block.type}
                            onChange={(e) => changeBlockType(block.id, e.target.value as Block['type'])}
                            className="bg-transparent text-stone-500 hover:text-stone-800 transition outline-none cursor-pointer border-0 p-0 text-[10px] font-semibold"
                          >
                            <option value="paragraph">Paragraph</option>
                            <option value="heading-h2">Heading H2</option>
                            <option value="heading-h3">Heading H3</option>
                            <option value="image">Image</option>
                            <option value="gallery">Gallery</option>
                            <option value="quote">Quote</option>
                            <option value="list-bullet">Bullet List</option>
                            <option value="list-number">Numbered List</option>
                            <option value="divider">Divider</option>
                            <option value="video">Video</option>
                            <option value="youtube">YouTube Embed</option>
                            <option value="link">Link</option>
                            <option value="button">Button</option>
                            <option value="columns">Columns</option>
                            <option value="table-of-contents">Table of Contents</option>
                            <option value="alsoRead">Also Read Card</option>
                            <option value="faq">FAQ Section</option>
                            <option value="html">Custom HTML</option>
                          </select>
                        </div>

                        {/* RENDER INDIVIDUAL BLOCK EDITORS */}
                        {block.type === 'paragraph' && (
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            placeholder="Start writing or choose another block type..."
                            className="w-full text-base font-serif text-stone-850 leading-relaxed border-0 focus:outline-none p-0 resize-none bg-transparent min-h-[44px]"
                          />
                        )}

                        {(block.type === 'heading-h2') && (
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            placeholder="Heading H2"
                            className="w-full text-2xl font-serif font-bold text-stone-950 border-0 focus:outline-none bg-transparent p-0"
                          />
                        )}

                        {(block.type === 'heading-h3') && (
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            placeholder="Heading H3"
                            className="w-full text-xl font-serif font-bold text-stone-900 border-0 focus:outline-none bg-transparent p-0"
                          />
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <input
                              type="text"
                              value={block.attrs?.url || ''}
                              onChange={(e) => updateBlockAttrs(block.id, { url: e.target.value })}
                              placeholder="Image URL (e.g., https://...)"
                              className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={block.attrs?.caption || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { caption: e.target.value })}
                                placeholder="Caption"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                              />
                              <input
                                type="text"
                                value={block.attrs?.alt || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { alt: e.target.value })}
                                placeholder="Alt Text"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            {block.attrs?.url && (
                              <img src={block.attrs.url} alt="" className="w-full h-32 object-cover rounded mt-2 border border-stone-200" />
                            )}
                          </div>
                        )}

                        {block.type === 'gallery' && (
                          <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
                            <div className="text-xs font-semibold text-stone-600 mb-1">Gallery Images</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {(block.attrs?.images || []).map((img: any, idx: number) => (
                                <div key={idx} className="bg-white p-2 border border-stone-200 rounded relative group/img">
                                  <img src={img.url} alt="" className="w-full h-20 object-cover rounded mb-1" />
                                  <input
                                    type="text"
                                    value={img.caption || ''}
                                    onChange={(e) => {
                                      const updatedImages = [...(block.attrs?.images || [])];
                                      updatedImages[idx] = { ...img, caption: e.target.value };
                                      updateBlockAttrs(block.id, { images: updatedImages });
                                    }}
                                    placeholder="Caption"
                                    className="w-full border border-stone-200 rounded px-1.5 py-0.5 text-[10px]"
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedImages = (block.attrs?.images || []).filter((_: any, i: number) => i !== idx);
                                      updateBlockAttrs(block.id, { images: updatedImages });
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover/img:opacity-100 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              
                              {/* Add to Gallery Box */}
                              <button
                                onClick={() => {
                                  const url = prompt("Enter Image URL:");
                                  if (url) {
                                    const updatedImages = [...(block.attrs?.images || []), { url, caption: '' }];
                                    updateBlockAttrs(block.id, { images: updatedImages });
                                  }
                                }}
                                className="border border-dashed border-stone-300 rounded hover:border-amber-400 bg-white transition flex flex-col items-center justify-center p-3 h-full min-h-[100px]"
                              >
                                <Plus className="w-4 h-4 text-stone-400 mb-1" />
                                <span className="text-[10px] text-stone-500 font-semibold">Add Image</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Quote words..."
                              className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs font-serif italic focus:outline-none focus:border-amber-400"
                            />
                            <input
                              type="text"
                              value={block.attrs?.author || ''}
                              onChange={(e) => updateBlockAttrs(block.id, { author: e.target.value })}
                              placeholder="Author / Source"
                              className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}

                        {(block.type === 'list-bullet' || block.type === 'list-number') && (
                          <div className="space-y-1">
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Enter list items (one per line)..."
                              className="w-full bg-transparent border-0 focus:outline-none text-base font-serif leading-relaxed min-h-[80px]"
                            />
                            <div className="text-[10px] text-stone-400 font-medium italic">Type each list point on a new line.</div>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <div className="py-2 flex items-center justify-center">
                            <div className="w-1/2 h-[1px] bg-stone-300" />
                          </div>
                        )}

                        {block.type === 'video' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <input
                              type="text"
                              value={block.attrs?.url || ''}
                              onChange={(e) => updateBlockAttrs(block.id, { url: e.target.value })}
                              placeholder="Video URL (e.g., https://...)"
                              className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}

                        {block.type === 'youtube' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <input
                              type="text"
                              value={block.attrs?.youtubeId || ''}
                              onChange={(e) => updateBlockAttrs(block.id, { youtubeId: e.target.value })}
                              placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)"
                              className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                            />
                          </div>
                        )}

                        {block.type === 'link' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={block.attrs?.linkText || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { linkText: e.target.value })}
                                placeholder="Link Text"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                              />
                              <input
                                type="text"
                                value={block.attrs?.linkUrl || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { linkUrl: e.target.value })}
                                placeholder="Link URL"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'button' && (
                          <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={block.attrs?.buttonText || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { buttonText: e.target.value })}
                                placeholder="Button Text"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={block.attrs?.buttonUrl || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { buttonUrl: e.target.value })}
                                placeholder="Button URL"
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={block.attrs?.buttonStyle || 'primary'}
                                onChange={(e) => updateBlockAttrs(block.id, { buttonStyle: e.target.value })}
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none"
                              >
                                <option value="primary">Primary (Pink)</option>
                                <option value="secondary">Secondary (Gray)</option>
                                <option value="outline">Outline</option>
                              </select>
                              <select
                                value={block.attrs?.buttonAlign || 'center'}
                                onChange={(e) => updateBlockAttrs(block.id, { buttonAlign: e.target.value })}
                                className="bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none"
                              >
                                <option value="left">Align Left</option>
                                <option value="center">Align Center</option>
                                <option value="right">Align Right</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {block.type === 'columns' && (
                          <div className="space-y-3 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                            <div className="text-stone-600 font-semibold mb-1">Two-Column Layout Layout</div>
                            <div className="grid grid-cols-2 gap-3">
                              {(block.attrs?.columns || []).map((col: any, ci: number) => (
                                <div key={col.id} className="bg-white p-3 border border-stone-200 rounded shadow-sm">
                                  <div className="font-bold text-stone-400 uppercase tracking-wider mb-2 font-mono text-[9px]">Column {ci + 1}</div>
                                  {col.blocks.map((subBlock: Block, sbi: number) => (
                                    <textarea
                                      key={subBlock.id}
                                      value={subBlock.content}
                                      onChange={(e) => {
                                        const updatedCols = [...(block.attrs?.columns || [])];
                                        updatedCols[ci].blocks[sbi] = { ...subBlock, content: e.target.value };
                                        updateBlockAttrs(block.id, { columns: updatedCols });
                                      }}
                                      placeholder="Write column content..."
                                      className="w-full bg-stone-50 border border-stone-200 rounded p-2 text-xs font-serif min-h-[60px]"
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'table-of-contents' && (
                          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-stone-600 text-xs flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-pink-600" /> Table of Contents Block
                            </span>
                            <span className="text-[11px] text-stone-400">Auto-generates from article H2/H3 headings</span>
                          </div>
                        )}

                        {block.type === 'alsoRead' && (
                          <AlsoReadBlockEditor
                            block={block}
                            updateBlockAttrs={updateBlockAttrs}
                          />
                        )}

                        {block.type === 'faq' && (
                          <FaqBlockEditor
                            block={block}
                            updateBlockAttrs={updateBlockAttrs}
                          />
                        )}

                        {block.type === 'html' && (
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            placeholder="Write raw custom HTML tags here..."
                            className="w-full p-3 bg-stone-900 text-amber-100 font-mono text-xs rounded border border-stone-800 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        )}
                      </div>

                      {/* INLINE BUTTON TO INSERT BLOCKS UNDER THIS ONE */}
                      <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 transition z-35 ${
                        (activePicker?.type === 'inline' && activePicker.index === index)
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (activePicker?.type === 'inline' && activePicker.index === index) {
                                setActivePicker(null);
                              } else {
                                setActivePicker({ type: 'inline', index });
                              }
                            }}
                            className="w-5 h-5 bg-stone-900 text-white rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-stone-950 transition shadow-md sereia-picker-trigger"
                            title="Add Block below"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* QUICK ADD BLOCK INLINE DROPDOWN POPUP */}
                          <AnimatePresence>
                            {activePicker?.type === 'inline' && activePicker.index === index && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.12, ease: "easeOut" }}
                                className="absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-stone-200 shadow-xl rounded-xl p-2.5 grid grid-cols-3 gap-1 w-64 text-[10px] font-semibold text-stone-600 z-50 sereia-picker-container max-h-[220px] overflow-y-auto"
                              >
                                <button onClick={() => addBlock('paragraph', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Type className="w-3.5 h-3.5 text-stone-500" /> Paragraph
                                </button>
                                <button onClick={() => addBlock('heading-h2', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <span className="font-bold text-stone-600">H2</span> Heading 2
                                </button>
                                <button onClick={() => addBlock('heading-h3', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <span className="font-bold text-stone-600">H3</span> Heading 3
                                </button>
                                <button onClick={() => addBlock('image', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <ImageIcon className="w-3.5 h-3.5 text-stone-500" /> Image
                                </button>
                                <button onClick={() => addBlock('gallery', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Grid className="w-3.5 h-3.5 text-stone-500" /> Gallery
                                </button>
                                <button onClick={() => addBlock('quote', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Quote className="w-3.5 h-3.5 text-stone-500" /> Quote
                                </button>
                                <button onClick={() => addBlock('list-bullet', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <List className="w-3.5 h-3.5 text-stone-500" /> Bullet List
                                </button>
                                <button onClick={() => addBlock('list-number', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <ListOrdered className="w-3.5 h-3.5 text-stone-500" /> Numbered List
                                </button>
                                <button onClick={() => addBlock('divider', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Minus className="w-3.5 h-3.5 text-stone-500" /> Divider
                                </button>
                                <button onClick={() => addBlock('video', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Video className="w-3.5 h-3.5 text-stone-500" /> Video
                                </button>
                                <button onClick={() => addBlock('youtube', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Youtube className="w-3.5 h-3.5 text-stone-500" /> YouTube
                                </button>
                                <button onClick={() => addBlock('link', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <LinkIcon className="w-3.5 h-3.5 text-stone-500" /> Link
                                </button>
                                <button onClick={() => addBlock('button', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Sparkles className="w-3.5 h-3.5 text-stone-500" /> Button
                                </button>
                                <button onClick={() => addBlock('columns', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Columns className="w-3.5 h-3.5 text-stone-500" /> Columns
                                </button>
                                <button onClick={() => addBlock('html', index)} className="p-1.5 hover:bg-stone-100 rounded text-center flex flex-col items-center gap-1 text-stone-700">
                                  <Code className="w-3.5 h-3.5 text-stone-500" /> HTML
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* CENTERED ADD BLOCK TRIGGER AT THE END */}
              <div className="py-6 flex justify-center border-t border-stone-100">
                <div className="relative">
                  <button
                    onClick={() => {
                      if (activePicker?.type === 'end') {
                        setActivePicker(null);
                      } else {
                        setActivePicker({ type: 'end' });
                      }
                    }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-amber-400 hover:text-stone-950 transition shadow font-bold text-xs flex items-center gap-1.5 sereia-picker-trigger"
                  >
                    <Plus className="w-4 h-4" /> Add Block
                  </button>

                  {/* BLOCK MENU POPUP */}
                  <AnimatePresence>
                    {activePicker?.type === 'end' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-stone-200 shadow-2xl rounded-xl p-3.5 grid grid-cols-4 gap-2 w-80 text-center text-stone-600 text-[10px] font-bold z-50 sereia-picker-container"
                      >
                        <button onClick={() => addBlock('paragraph')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Type className="w-4 h-4 text-stone-500" /> Paragraph
                        </button>
                        <button onClick={() => addBlock('heading-h2')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <span className="font-extrabold text-stone-700">H2</span> Heading 2
                        </button>
                        <button onClick={() => addBlock('heading-h3')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <span className="font-extrabold text-stone-700">H3</span> Heading 3
                        </button>
                        <button onClick={() => addBlock('image')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <ImageIcon className="w-4 h-4 text-stone-500" /> Image
                        </button>
                        <button onClick={() => addBlock('gallery')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Grid className="w-4 h-4 text-stone-500" /> Gallery
                        </button>
                        <button onClick={() => addBlock('quote')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Quote className="w-4 h-4 text-stone-500" /> Quote
                        </button>
                        <button onClick={() => addBlock('list-bullet')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <List className="w-4 h-4 text-stone-500" /> Bullet List
                        </button>
                        <button onClick={() => addBlock('list-number')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <ListOrdered className="w-4 h-4 text-stone-500" /> Numbered List
                        </button>
                        <button onClick={() => addBlock('divider')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Minus className="w-4 h-4 text-stone-500" /> Divider
                        </button>
                        <button onClick={() => addBlock('video')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Video className="w-4 h-4 text-stone-500" /> Video
                        </button>
                        <button onClick={() => addBlock('youtube')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Youtube className="w-4 h-4 text-stone-500" /> YouTube
                        </button>
                        <button onClick={() => addBlock('link')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <LinkIcon className="w-4 h-4 text-stone-500" /> Link
                        </button>
                        <button onClick={() => addBlock('button')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Sparkles className="w-4 h-4 text-stone-500" /> Button
                        </button>
                        <button onClick={() => addBlock('columns')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Columns className="w-4 h-4 text-stone-500" /> Columns
                        </button>
                        <button onClick={() => addBlock('table-of-contents')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <BookOpen className="w-4 h-4 text-stone-500" /> TOC
                        </button>
                        <button onClick={() => addBlock('alsoRead')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <BookOpen className="w-4 h-4 text-pink-600" /> Also Read
                        </button>
                        <button onClick={() => addBlock('faq')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <HelpCircle className="w-4 h-4 text-pink-600" /> FAQ
                        </button>
                        <button onClick={() => addBlock('html')} className="p-2 hover:bg-stone-100 rounded flex flex-col items-center gap-1.5 text-stone-700">
                          <Code className="w-4 h-4 text-stone-500" /> HTML
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2B. RIGHT POST SETTINGS SIDEBAR */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-[340px] border-l border-stone-200 bg-white overflow-y-auto flex flex-col shrink-0 text-xs"
            >
              {/* Settings Header */}
              <div className="p-4 border-b border-stone-200 font-bold text-stone-800 uppercase tracking-wider font-mono bg-stone-50/50 flex items-center justify-between">
                <span>Article Settings</span>
                <Settings className="w-4 h-4 text-stone-400" />
              </div>

              {/* Sidebar Settings form inputs */}
              <div className="p-4 space-y-5">
                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Publication Date & Time (Admin Only) */}
                {role === 'ADMIN' && (
                  <div className="space-y-1.5">
                    <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Publication Date & Time (IST)</label>
                    <input
                      type="datetime-local"
                      value={publishedAtLocal}
                      onChange={(e) => setPublishedAtLocal(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400 text-sm"
                    />
                    <p className="text-[9px] text-stone-500">Only editable by Admin. Leave blank for auto-assign on publish.</p>
                  </div>
                )}

                {/* Author Selection */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Post Author</label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slug Input */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="article-url-slug"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Primary Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
                  >
                    {categories.filter((c) => !c.parentId).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Subcategory</label>
                  <select
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
                  >
                    <option value="none">None</option>
                    {categories.filter((c) => c.parentId === categoryId || c.parentId).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Input */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Tags</label>
                  <div className="w-full bg-stone-50 border border-stone-200 rounded p-1.5 flex flex-wrap gap-1.5 focus-within:border-amber-400">
                    {tagChips.map((chip, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-stone-200 text-stone-800 text-xs rounded">
                        {chip}
                        <button type="button" onClick={() => setTagChips(tagChips.filter((_, i) => i !== index))} className="text-stone-500 hover:text-stone-800 focus:outline-none">
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInputValue}
                      onChange={(e) => setTagInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = tagInputValue.trim().replace(/^#+/, '');
                          if (val && !tagChips.includes(val)) {
                            setTagChips([...tagChips, val]);
                          }
                          setTagInputValue('');
                        }
                      }}
                      onBlur={() => {
                        const val = tagInputValue.trim().replace(/^#+/, '');
                        if (val && !tagChips.includes(val)) {
                          setTagChips([...tagChips, val]);
                        }
                        setTagInputValue('');
                      }}
                      placeholder={tagChips.length === 0 ? "e.g., fashion, beauty, summer" : ""}
                      className="flex-1 bg-transparent px-1 py-0.5 text-sm text-stone-800 focus:outline-none min-w-[120px]"
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Featured Image URL</label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <input
                    type="text"
                    value={featuredImageCaption}
                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                    placeholder="Image Caption / Credit"
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400 text-[11px]"
                  />
                  {featuredImage && (
                    <img src={featuredImage} alt="Featured Preview" className="w-full h-24 object-cover rounded mt-2 border border-stone-200" />
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px]">Post Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a brief article synopsis..."
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-2 text-stone-800 focus:outline-none focus:border-amber-400 h-20 resize-none font-serif"
                  />
                </div>

                {/* Flags Section */}
                <div className="space-y-2 pt-2 border-t border-stone-150">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Featured Article</span>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-pink-600 w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Trending Article</span>
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="accent-pink-600 w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Editor's Pick</span>
                    <input
                      type="checkbox"
                      checked={isEditorPick}
                      onChange={(e) => setIsEditorPick(e.target.checked)}
                      className="accent-pink-600 w-4 h-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Allow Comments</span>
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="accent-pink-600 w-4 h-4"
                    />
                  </div>
                </div>

                {/* SEO Fields Accordion */}
                <div className="space-y-3 pt-3 border-t border-stone-150">
                  <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-2">Search Engine Optimization (SEO)</div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Google Search Header Title"
                      className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono">Focus Keyword</label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="SEO target keyword"
                      className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Google snippet meta description"
                      className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 h-16 resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
