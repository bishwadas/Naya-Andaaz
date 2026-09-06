'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Settings,
  Sparkles,
  Code,
  Check,
  Trash2,
  Loader2,
  Plus,
  ChevronUp,
  ChevronDown,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  Quote,
  List,
  ListOrdered,
  Minus,
  FileText,
  HelpCircle,
  AlertCircle,
  Layers,
  FileCode
} from 'lucide-react';
import { Page, PageStatus, User } from '@/types';
import { Block, serializeBlocksToHtml, parseHtmlToBlocks } from '@/lib/blocks';
import { BLOCK_CATALOG, BlockCatalogItem } from '@/components/editor/BlockCatalog';
import {
  FaqBlockEditor,
  TableBlockEditor,
  AlsoReadBlockEditor,
  BetweenBlockInserter,
} from '@/components/editor/BlockSubEditors';

interface PageEditorProps {
  initialPage?: Page | null;
  users?: User[];
}

export function PageEditor({
  initialPage = null,
  users = [],
}: PageEditorProps) {
  const router = useRouter();

  // 1. Page State — cleanly isolated
  const [pageId, setPageId] = useState<string>(initialPage?.id || '');
  const [title, setTitle] = useState<string>(initialPage?.title || '');
  const [slug, setSlug] = useState<string>(initialPage?.slug || '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(Boolean(initialPage?.slug));
  const [status, setStatus] = useState<PageStatus>(initialPage?.status || 'published');
  const [authorId, setAuthorId] = useState<string>(initialPage?.authorId || users[0]?.id || '');
  const [featuredImage, setFeaturedImage] = useState<string>(initialPage?.featuredImage || '');
  const [seoTitle, setSeoTitle] = useState<string>(initialPage?.seoTitle || '');
  const [isSeoTitleManuallyEdited, setIsSeoTitleManuallyEdited] = useState<boolean>(Boolean(initialPage?.seoTitle));
  const [metaDescription, setMetaDescription] = useState<string>(initialPage?.metaDescription || '');

  // Content Blocks and HTML
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialPage?.content) {
      return parseHtmlToBlocks(initialPage.content);
    }
    return [
      {
        id: `blk_${Date.now()}_1`,
        type: 'paragraph',
        content: '',
      },
    ];
  });
  const [htmlContent, setHtmlContent] = useState<string>(initialPage?.content || '');

  // UI States
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Handle title changes & auto-slug generation
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited && !initialPage) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
    if (!isSeoTitleManuallyEdited && !initialPage) {
      setSeoTitle(val ? `${val} — Sereia` : '');
    }
  };

  // Block management
  const updateBlockContent = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  };

  const updateBlockAttrs = (id: string, attrs: any) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, attrs: { ...b.attrs, ...attrs } } : b))
    );
  };

  const addBlock = (type: Block['type']) => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === type);
    const newBlock: Block = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: '',
      attrs: catalogItem?.defaultAttrs ? JSON.parse(JSON.stringify(catalogItem.defaultAttrs)) : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const insertBlockAt = (index: number, type: Block['type'] = 'paragraph') => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === type);
    const newBlock: Block = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: '',
      attrs: catalogItem?.defaultAttrs ? JSON.parse(JSON.stringify(catalogItem.defaultAttrs)) : {},
    };
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newBlock);
      return next;
    });
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: `blk_${Date.now()}`, type: 'paragraph', content: '' }]);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setBlocks(next);
  };

  // Mode switching
  const handleSwitchToHtml = () => {
    const serialized = serializeBlocksToHtml(blocks);
    setHtmlContent(serialized);
    setEditMode('html');
  };

  const handleSwitchToVisual = () => {
    const parsed = parseHtmlToBlocks(htmlContent);
    setBlocks(parsed.length > 0 ? parsed : [{ id: `blk_${Date.now()}`, type: 'paragraph', content: '' }]);
    setEditMode('visual');
  };

  // AI draft generator
  const handleAiDraft = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a page title first to guide the AI assistant.');
      return;
    }

    setIsAiGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write comprehensive, elegant editorial static page content for a high-end magazine page titled: "${title}". Format the content cleanly with headings (<h2> and <h3>), well-structured paragraphs (<p>), and informative text. Output standard clean HTML.`,
        }),
      });

      const data = await res.json();
      const text = data.content || data.text;
      if (text) {
        setHtmlContent(text);
        const parsed = parseHtmlToBlocks(text);
        setBlocks(parsed.length > 0 ? parsed : [{ id: `blk_${Date.now()}`, type: 'paragraph', content: text }]);
        setSuccessMsg('AI draft generated successfully!');
      } else {
        throw new Error('AI returned an empty response.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save Page
  const handleSavePage = async (targetStatus?: PageStatus) => {
    const finalStatus = targetStatus || status;
    if (!title.trim()) {
      setErrorMsg('Page title is required.');
      return;
    }

    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (!finalSlug) finalSlug = `page-${Date.now()}`;

    const finalContent = editMode === 'html' ? htmlContent : serializeBlocksToHtml(blocks);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      content: finalContent,
      status: finalStatus,
      authorId: authorId || (users[0]?.id || 'usr_admin_01'),
      authorName: users.find((u) => u.id === authorId)?.name || 'Editorial Staff',
      featuredImage: featuredImage.trim() || null,
      seoTitle: seoTitle.trim() || `${title.trim()} — Sereia`,
      metaDescription: metaDescription.trim() || null,
    };

    setIsSaving(true);
    setSaveStatus('Saving...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
      const method = pageId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Server responded with an error while saving.');
      }

      setStatus(finalStatus);
      setSaveStatus('Saved');
      setSuccessMsg(pageId ? 'Page updated successfully!' : 'Page created and published successfully!');

      if (!pageId && resData.id) {
        setPageId(resData.id);
        router.replace(`/admin/pages/${resData.id}/edit`);
      }
    } catch (err: any) {
      console.error('Error saving page:', err);
      setErrorMsg(err.message || 'An error occurred while saving the page.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPublicUrl = slug === 'privacy-policy' ? '/privacy-policy' : `/page/${slug || 'preview'}`;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-pink-100 selection:text-pink-900">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            id="page-editor-back-btn"
            type="button"
            onClick={() => router.push('/admin/pages')}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 transition flex items-center justify-center border border-stone-200 bg-white"
            title="Go back to Pages list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
                status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {status}
            </span>
            {saveStatus && (
              <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                {saveStatus === 'Saving...' && <Loader2 className="w-3 h-3 animate-spin text-pink-600" />}
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-stone-100 p-0.5 rounded-lg flex items-center border border-stone-200 text-xs font-medium mr-1">
            <button
              type="button"
              onClick={() => editMode === 'html' && handleSwitchToVisual()}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                editMode === 'visual' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-600" /> Visual
            </button>
            <button
              type="button"
              onClick={() => editMode === 'visual' && handleSwitchToHtml()}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                editMode === 'html' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-stone-600" /> HTML
            </button>
          </div>

          <button
            id="page-editor-preview-toggle"
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2 hover:bg-stone-100 text-stone-700 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 border border-stone-200 bg-white shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Editor' : 'Preview'}
          </button>

          <button
            id="page-editor-save-draft-btn"
            type="button"
            onClick={() => handleSavePage('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
          >
            {isSaving && status === 'draft' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Draft
          </button>

          <button
            id="page-editor-publish-btn"
            type="button"
            onClick={() => handleSavePage('published')}
            disabled={isSaving}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs hover:shadow-sm disabled:opacity-50"
          >
            {isSaving && status === 'published' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {pageId ? 'Update Page' : 'Publish Page'}
          </button>

          <div className="h-6 w-px bg-stone-200 mx-1" />

          <button
            id="page-editor-settings-toggle"
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition flex items-center justify-center ${
              showSettings ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 bg-white'
            }`}
            title="Toggle Settings Sidebar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast Alerts */}
        <AnimatePresence>
          {(errorMsg || successMsg) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-800 text-xs shadow-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="flex-1 font-medium">{errorMsg}</div>
                  <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-700 text-xs font-bold">
                    Dismiss
                  </button>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs shadow-xl flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="flex-1 font-medium">{successMsg}</div>
                  <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-700 text-xs font-bold">
                    Dismiss
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* LEFT / CENTER VIEWPORT */}
        <div className="flex-1 overflow-y-auto bg-white px-6 py-10 md:px-12 flex justify-center">
          {showPreview ? (
            /* PREVIEW VIEWPORT */
            <div className="max-w-3xl w-full space-y-8 font-serif leading-relaxed text-stone-800">
              <div className="text-center py-3 bg-stone-50 text-stone-600 border border-stone-200 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-pink-600" /> Live Page Viewport Preview
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-950 leading-tight">
                  {title || 'Untitled Page'}
                </h1>
                <div className="text-xs text-stone-400 font-mono">
                  Slug: {currentPublicUrl}
                </div>
              </div>

              {featuredImage && (
                <figure className="my-8 rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-stone-200">
                  <img src={featuredImage} alt={title} className="w-full h-auto max-h-[420px] object-cover" />
                </figure>
              )}

              {/* RENDER CONTENT */}
              <article className="prose prose-stone prose-lg max-w-none text-stone-800 leading-relaxed space-y-6 pt-4 border-t border-stone-100">
                {(editMode === 'html' ? parseHtmlToBlocks(htmlContent) : blocks).map((block) => (
                  <div key={block.id}>
                    {block.type === 'paragraph' && (
                      <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
                        {block.content || <span className="text-stone-300 italic">Empty paragraph</span>}
                      </p>
                    )}
                    {block.type === 'heading-h2' && (
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4">
                        {block.content}
                      </h2>
                    )}
                    {block.type === 'heading-h3' && (
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3">
                        {block.content}
                      </h3>
                    )}
                    {block.type === 'quote' && (
                      <blockquote className="border-l-4 border-pink-500 pl-4 py-1 italic text-lg text-stone-700 bg-stone-50 my-6 rounded-r">
                        "{block.content}"
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
                    {block.type === 'image' && (
                      <figure className="my-6 rounded-xl overflow-hidden border border-stone-200 p-1">
                        <img src={block.attrs?.url} alt={block.attrs?.alt || ''} className="w-full h-auto rounded" />
                        {block.attrs?.caption && (
                          <figcaption className="text-center text-xs text-stone-500 italic mt-2">{block.attrs.caption}</figcaption>
                        )}
                      </figure>
                    )}
                    {block.type === 'divider' && <hr className="my-8 border-t border-stone-200" />}
                    {block.type === 'button' && (
                      <div className="my-6">
                        <a
                          href={block.attrs?.buttonUrl || '#'}
                          className="inline-block px-5 py-2.5 bg-pink-600 text-white rounded-lg font-semibold text-xs transition"
                        >
                          {block.attrs?.buttonText || 'Button'}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </article>
            </div>
          ) : (
            /* EDITOR VIEWPORT */
            <div className="max-w-3xl w-full space-y-8 font-sans">
              {/* Top Banner / AI Draft Assistant */}
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-3.5 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                  <FileCode className="w-4 h-4 text-pink-600" />
                  <span>Sereia Static Page CMS Engine</span>
                </div>
                <button
                  id="page-editor-ai-draft-btn"
                  type="button"
                  onClick={handleAiDraft}
                  disabled={isAiGenerating}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  {isAiGenerating ? 'Generating Draft...' : 'Generate with AI'}
                </button>
              </div>

              {/* Title & Slug Area */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="page-title-input" className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 font-semibold">
                    Page Title <span className="text-pink-600">*</span>
                  </label>
                  <input
                    id="page-title-input"
                    type="text"
                    placeholder="Enter page title (e.g. About Us, Terms of Service)..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-2xl sm:text-3xl font-serif font-bold text-stone-900 border-b-2 border-stone-200 pb-2 focus:outline-none focus:border-pink-600 transition placeholder:text-stone-300"
                  />
                </div>

                {/* Slug display / edit */}
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg text-xs">
                  <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="text-stone-500 font-mono">URL Slug:</span>
                  <span className="text-stone-400 font-mono">/page/</span>
                  <input
                    id="page-slug-input"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="page-slug"
                    className="flex-1 bg-transparent font-mono font-semibold text-stone-800 focus:outline-none border-b border-transparent focus:border-pink-500"
                  />
                </div>
              </div>

              {/* CONTENT EDITING AREA */}
              {editMode === 'html' ? (
                /* HTML RAW EDITOR */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                      Raw HTML Source Content
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {htmlContent.length} chars
                    </span>
                  </div>
                  <textarea
                    id="page-html-content-textarea"
                    rows={20}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<h2>Heading</h2><p>Page body paragraphs...</p>"
                    className="w-full p-4 bg-stone-900 text-stone-100 font-mono text-xs leading-relaxed rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
               ) : (
                /* VISUAL BLOCK EDITOR */
                <div className="space-y-6">
                  {/* Block Insertion Toolbar */}
                  <div className="sticky top-20 z-20 bg-stone-50/95 backdrop-blur-md border border-stone-200 rounded-xl p-3 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase">
                      <span>Add Content Block</span>
                      <span className="text-[10px] text-pink-600">
                        {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'} active
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto p-1">
                      {BLOCK_CATALOG.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => addBlock(item.type)}
                          className="px-2.5 py-1.5 bg-white hover:bg-pink-50 hover:border-pink-300 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title={item.description}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Block List */}
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <React.Fragment key={block.id}>
                        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-3 group hover:border-pink-300 transition">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded flex items-center gap-1.5">
                              {BLOCK_CATALOG.find((b) => b.type === block.type)?.icon}
                              {block.type.replace('-', ' ')}
                            </span>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveBlock(index, 'up')}
                                className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                                title="Move Block Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === blocks.length - 1}
                                onClick={() => moveBlock(index, 'down')}
                                className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                                title="Move Block Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="p-1 hover:bg-rose-50 rounded text-rose-600 ml-1 cursor-pointer"
                                title="Delete Block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block Content Inputs */}
                          {block.type === 'heading-h2' && (
                            <input
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Section Heading (H2)..."
                              className="w-full font-serif font-bold text-xl text-stone-900 border-b border-stone-200 pb-1 focus:outline-none focus:border-pink-600"
                            />
                          )}

                          {block.type === 'heading-h3' && (
                            <input
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Subsection Heading (H3)..."
                              className="w-full font-serif font-bold text-lg text-stone-900 border-b border-stone-200 pb-1 focus:outline-none focus:border-pink-600"
                            />
                          )}

                          {block.type === 'heading-h4' && (
                            <input
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Minor Heading (H4)..."
                              className="w-full font-serif font-bold text-base text-stone-900 border-b border-stone-200 pb-1 focus:outline-none focus:border-pink-600"
                            />
                          )}

                          {block.type === 'paragraph' && (
                            <textarea
                              rows={3}
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              placeholder="Write paragraph text (HTML formatting allowed)..."
                              className="w-full font-serif text-sm leading-relaxed text-stone-800 border border-stone-200 rounded-lg p-3 focus:outline-none focus:border-pink-600"
                            />
                          )}

                          {block.type === 'quote' && (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                placeholder="Editorial pullquote text..."
                                className="w-full italic font-serif text-sm text-stone-800 border-l-4 border-pink-500 bg-stone-50 p-3 rounded-r-lg focus:outline-none"
                              />
                              <input
                                type="text"
                                value={block.attrs?.author || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { author: e.target.value })}
                                placeholder="Author / Source Attribution (Optional)..."
                                className="w-full text-xs font-sans border border-stone-200 rounded-lg p-2 focus:outline-none"
                              />
                            </div>
                          )}

                          {(block.type === 'list-bullet' || block.type === 'list-number') && (
                            <div className="space-y-1">
                              <textarea
                                rows={4}
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                placeholder="One list item per line..."
                                className="w-full font-serif text-sm text-stone-800 border border-stone-200 rounded-lg p-3 focus:outline-none focus:border-pink-600"
                              />
                              <span className="text-[10px] text-stone-400 font-mono">
                                Tip: Press Enter for each new item in the list
                              </span>
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.attrs?.url || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { url: e.target.value })}
                                placeholder="Image URL (https://...)"
                                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-pink-600"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={block.attrs?.alt || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { alt: e.target.value })}
                                  placeholder="Alt text..."
                                  className="w-full text-xs border border-stone-200 rounded-lg p-2 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={block.attrs?.caption || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { caption: e.target.value })}
                                  placeholder="Caption..."
                                  className="w-full text-xs border border-stone-200 rounded-lg p-2 focus:outline-none"
                                />
                              </div>
                              {block.attrs?.url && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-stone-100 max-h-40">
                                  <img src={block.attrs.url} alt="" className="w-full h-40 object-cover" />
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'faq' && (
                            <FaqBlockEditor block={block} updateBlockAttrs={updateBlockAttrs} />
                          )}

                          {block.type === 'table' && (
                            <TableBlockEditor block={block} updateBlockAttrs={updateBlockAttrs} />
                          )}

                          {block.type === 'alsoRead' && (
                            <AlsoReadBlockEditor block={block} updateBlockAttrs={updateBlockAttrs} />
                          )}

                          {block.type === 'button' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={block.attrs?.buttonText || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { buttonText: e.target.value })}
                                  placeholder="Button Label"
                                  className="text-xs border border-stone-200 rounded-lg p-2 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={block.attrs?.buttonUrl || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { buttonUrl: e.target.value })}
                                  placeholder="Link URL (https://...)"
                                  className="text-xs border border-stone-200 rounded-lg p-2 focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={block.attrs?.buttonStyle || 'primary'}
                                  onChange={(e) => updateBlockAttrs(block.id, { buttonStyle: e.target.value })}
                                  className="text-xs border border-stone-200 rounded-lg p-1.5 bg-stone-50"
                                >
                                  <option value="primary">Primary (Pink)</option>
                                  <option value="secondary">Secondary (Dark)</option>
                                  <option value="outline">Outline</option>
                                </select>
                                <select
                                  value={block.attrs?.buttonAlign || 'left'}
                                  onChange={(e) => updateBlockAttrs(block.id, { buttonAlign: e.target.value })}
                                  className="text-xs border border-stone-200 rounded-lg p-1.5 bg-stone-50"
                                >
                                  <option value="left">Align Left</option>
                                  <option value="center">Align Center</option>
                                  <option value="right">Align Right</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {block.type === 'code' && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.attrs?.language || 'javascript'}
                                onChange={(e) => updateBlockAttrs(block.id, { language: e.target.value })}
                                placeholder="Language (e.g. javascript, python, html)..."
                                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2 bg-stone-50"
                              />
                              <textarea
                                rows={4}
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                placeholder="Paste code snippet here..."
                                className="w-full font-mono text-xs bg-stone-900 text-emerald-300 p-3 rounded-lg border border-stone-800"
                              />
                            </div>
                          )}

                          {block.type === 'youtube' && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.attrs?.url || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { url: e.target.value })}
                                placeholder="YouTube Video URL (https://www.youtube.com/watch?v=...)"
                                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2.5"
                              />
                            </div>
                          )}

                          {block.type === 'audio' && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={block.attrs?.audioUrl || ''}
                                onChange={(e) => updateBlockAttrs(block.id, { audioUrl: e.target.value })}
                                placeholder="Audio MP3 URL..."
                                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={block.attrs?.audioTitle || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { audioTitle: e.target.value })}
                                  placeholder="Track Title..."
                                  className="text-xs border border-stone-200 rounded-lg p-2"
                                />
                                <input
                                  type="text"
                                  value={block.attrs?.audioArtist || ''}
                                  onChange={(e) => updateBlockAttrs(block.id, { audioArtist: e.target.value })}
                                  placeholder="Artist / Subtitle..."
                                  className="text-xs border border-stone-200 rounded-lg p-2"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'spacer' && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-stone-500 font-mono">Height:</span>
                              <input
                                type="number"
                                value={block.attrs?.height || 40}
                                onChange={(e) => updateBlockAttrs(block.id, { height: Number(e.target.value) })}
                                className="w-24 text-xs font-mono border border-stone-200 rounded-lg p-1.5"
                              />
                              <span className="text-xs text-stone-400 font-mono">px</span>
                            </div>
                          )}

                          {block.type === 'table-of-contents' && (
                            <p className="text-xs text-stone-500 italic">
                              Table of Contents dynamically generates navigation links based on all H2 and H3 headings in this page.
                            </p>
                          )}

                          {(block.type === 'separator' || block.type === 'divider') && (
                            <div className="py-2 text-center text-xs font-mono text-stone-400">
                              --- Horizontal Line Divider ---
                            </div>
                          )}
                        </div>

                        <BetweenBlockInserter targetIndex={index} onInsertParagraph={insertBlockAt} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SETTINGS SIDEBAR */}
        {showSettings && (
          <aside className="w-80 border-l border-stone-200 bg-stone-50 overflow-y-auto p-5 space-y-6 shrink-0 font-sans">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                Page Settings
              </span>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* 1. Status & Author Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                Publication Status
              </h4>

              <div className="space-y-3">
                <div>
                  <label htmlFor="page-status-select" className="block text-xs text-stone-500 mb-1">Status</label>
                  <select
                    id="page-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PageStatus)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-pink-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="trash">Trash</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="page-author-select" className="block text-xs text-stone-500 mb-1">Author</label>
                  <select
                    id="page-author-select"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-pink-600"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Featured Image Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                Featured Banner Image
              </h4>
              <input
                id="page-featured-image-input"
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="Image URL (https://...)"
                className="w-full text-xs font-mono border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none focus:border-pink-600 focus:bg-white"
              />
              {featuredImage ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-200">
                  <img src={featuredImage} alt="Featured Banner" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded text-[10px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-stone-200 rounded-lg p-4 text-center text-xs text-stone-400">
                  No banner selected (Optional)
                </div>
              )}
            </div>

            {/* 3. SEO Metadata Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider flex items-center justify-between">
                <span>SEO & Social</span>
                <Globe className="w-3.5 h-3.5 text-pink-600" />
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <label htmlFor="page-seo-title-input">SEO Title</label>
                    <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? 'text-amber-600' : 'text-stone-400'}`}>
                      {seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    id="page-seo-title-input"
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsSeoTitleManuallyEdited(true);
                    }}
                    placeholder={title ? `${title} — Sereia` : 'Page Title — Sereia'}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-600 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <label htmlFor="page-meta-description-input">Meta Description</label>
                    <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-amber-600' : 'text-stone-400'}`}>
                      {metaDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    id="page-meta-description-input"
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search engines..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 focus:outline-none focus:border-pink-600 focus:bg-white"
                  />
                </div>

                {/* Google Search Snippet Preview */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Search Snippet Preview
                  </span>
                  <div className="text-xs text-blue-800 font-semibold truncate font-serif">
                    {seoTitle || (title ? `${title} — Sereia` : 'Sereia Static Page')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono truncate">
                    https://sereia.news{currentPublicUrl}
                  </div>
                  <div className="text-[11px] text-stone-600 line-clamp-2">
                    {metaDescription || 'No meta description configured for this static CMS page.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Permalink & Actions Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-stone-900 uppercase font-mono tracking-wider">
                Frontend Link
              </h4>
              <a
                href={currentPublicUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full px-3 py-2 bg-stone-50 hover:bg-pink-50 hover:text-pink-700 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 transition flex items-center justify-between"
              >
                <span className="truncate font-mono">{currentPublicUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>

              {pageId && (
                <div className="pt-3 border-t border-stone-100">
                  <button
                    id="page-editor-trash-btn"
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to move "${title}" to trash?`)) return;
                      await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
                      router.push('/admin/pages');
                    }}
                    className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
