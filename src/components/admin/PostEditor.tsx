'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  UploadCloud,
  Edit,
  Code,
  Columns,
  Sparkles,
  HelpCircle,
  EyeOff,
  BookOpen,
  Search,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Unlink,
  Code2,
  Eraser,
  MoreHorizontal,
  Palette,
  Music,
  Table as TableIcon,
  Sliders,
  ExternalLink,
  Tag as TagIcon,
  FolderPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Share2,
  FileText,
  Layers,
  Globe,
  Radio,
  SlidersHorizontal,
  Maximize2,
  CornerDownRight,
} from 'lucide-react';
import { Block, BlockType, serializeBlocksToHtml, parseHtmlToBlocks, sanitizeHtml } from '@/lib/blocks';
import { Post, Category, Tag, User } from '@/types';

interface PostEditorProps {
  initialPost?: Post | null;
  categories: Category[];
  tags: Tag[];
  users: User[];
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR';
  backUrl?: string;
}

// ----------------------------------------------------
// BLOCK CATALOG DEFINITIONS
// ----------------------------------------------------
interface BlockCatalogItem {
  type: BlockType;
  name: string;
  category: 'TEXT' | 'MEDIA' | 'LAYOUT' | 'EMBED';
  icon: React.ReactNode;
  description: string;
  defaultAttrs?: any;
}

const BLOCK_CATALOG: BlockCatalogItem[] = [
  // TEXT CATEGORY
  {
    type: 'paragraph',
    name: 'Paragraph',
    category: 'TEXT',
    icon: <Type className="w-4 h-4 text-stone-700" />,
    description: 'Start writing standard body text and prose',
  },
  {
    type: 'heading-h2',
    name: 'Heading 2',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-900">H2</span>,
    description: 'Main major section heading',
  },
  {
    type: 'heading-h3',
    name: 'Heading 3',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-700">H3</span>,
    description: 'Subsection heading',
  },
  {
    type: 'heading-h4',
    name: 'Heading 4',
    category: 'TEXT',
    icon: <span className="text-xs font-bold font-serif text-stone-600">H4</span>,
    description: 'Minor subsection heading',
  },
  {
    type: 'quote',
    name: 'Quote / Pullquote',
    category: 'TEXT',
    icon: <Quote className="w-4 h-4 text-pink-600" />,
    description: 'Emphasized quote with author attribution',
  },
  {
    type: 'list-bullet',
    name: 'Bullet List',
    category: 'TEXT',
    icon: <List className="w-4 h-4 text-stone-700" />,
    description: 'Unordered bulleted list of key items',
  },
  {
    type: 'list-number',
    name: 'Numbered List',
    category: 'TEXT',
    icon: <ListOrdered className="w-4 h-4 text-stone-700" />,
    description: 'Sequential ordered numbered list',
  },
  {
    type: 'table',
    name: 'Table',
    category: 'TEXT',
    icon: <TableIcon className="w-4 h-4 text-pink-600" />,
    description: 'Custom rows and columns data table',
    defaultAttrs: {
      tableData: {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
        ],
        hasHeader: true,
      },
    },
  },
  {
    type: 'table-of-contents',
    name: 'Table of Contents',
    category: 'TEXT',
    icon: <BookOpen className="w-4 h-4 text-pink-600" />,
    description: 'Dynamic navigation generated from article headings',
  },
  {
    type: 'faq',
    name: 'FAQ Accordion',
    category: 'TEXT',
    icon: <HelpCircle className="w-4 h-4 text-pink-600" />,
    description: 'Structured Q&A accordions for reader guidance',
    defaultAttrs: {
      items: [{ question: 'What is the main topic?', answer: 'Detailed response here.' }],
    },
  },
  {
    type: 'alsoRead',
    name: 'Also Read Card',
    category: 'TEXT',
    icon: <BookOpen className="w-4 h-4 text-pink-600" />,
    description: 'Internal article recommendation card',
  },
  {
    type: 'code',
    name: 'Code Block',
    category: 'TEXT',
    icon: <Code className="w-4 h-4 text-stone-700" />,
    description: 'Formatted syntax code snippet',
    defaultAttrs: { language: 'javascript' },
  },

  // MEDIA CATEGORY
  {
    type: 'image',
    name: 'Image',
    category: 'MEDIA',
    icon: <ImageIcon className="w-4 h-4 text-stone-700" />,
    description: 'Single responsive image with caption',
    defaultAttrs: { url: '', alt: '', caption: '' },
  },
  {
    type: 'gallery',
    name: 'Image Gallery',
    category: 'MEDIA',
    icon: <Grid className="w-4 h-4 text-pink-600" />,
    description: 'Multi-image grid gallery',
    defaultAttrs: { images: [] },
  },
  {
    type: 'video',
    name: 'Video Player',
    category: 'MEDIA',
    icon: <Video className="w-4 h-4 text-stone-700" />,
    description: 'Direct MP4 / WebM video stream embed',
    defaultAttrs: { url: '' },
  },
  {
    type: 'audio',
    name: 'Audio Player',
    category: 'MEDIA',
    icon: <Music className="w-4 h-4 text-pink-600" />,
    description: 'MP3 podcast or music track player',
    defaultAttrs: { audioUrl: '', audioTitle: '', audioArtist: '' },
  },

  // LAYOUT CATEGORY
  {
    type: 'button',
    name: 'Button CTA',
    category: 'LAYOUT',
    icon: <ExternalLink className="w-4 h-4 text-pink-600" />,
    description: 'Clickable call-to-action button',
    defaultAttrs: { buttonText: 'Learn More', buttonUrl: '#', buttonStyle: 'primary', buttonAlign: 'left' },
  },
  {
    type: 'columns',
    name: 'Two Columns',
    category: 'LAYOUT',
    icon: <Columns className="w-4 h-4 text-stone-700" />,
    description: 'Side-by-side two column editorial block',
    defaultAttrs: {
      columns: [
        { blocks: [{ content: 'Left column text...' }] },
        { blocks: [{ content: 'Right column text...' }] },
      ],
    },
  },
  {
    type: 'separator',
    name: 'Divider Line',
    category: 'LAYOUT',
    icon: <Minus className="w-4 h-4 text-stone-700" />,
    description: 'Horizontal dividing line rule',
  },
  {
    type: 'spacer',
    name: 'Spacer',
    category: 'LAYOUT',
    icon: <Sliders className="w-4 h-4 text-stone-700" />,
    description: 'Empty space divider with adjustable height',
    defaultAttrs: { height: 40 },
  },

  // EMBED CATEGORY
  {
    type: 'embed',
    name: 'Embed / Social',
    category: 'EMBED',
    icon: <ExternalLink className="w-4 h-4 text-stone-700" />,
    description: 'Embed external content, Spotify, Vimeo, or iframe',
  },
  {
    type: 'youtube',
    name: 'YouTube',
    category: 'EMBED',
    icon: <Youtube className="w-4 h-4 text-red-600" />,
    description: 'Responsive YouTube video embed player',
  },
  {
    type: 'html',
    name: 'Custom HTML',
    category: 'EMBED',
    icon: <Code className="w-4 h-4 text-stone-700" />,
    description: 'Raw HTML, widgets, and embeds',
  },
];

// ----------------------------------------------------
// RICH EDITABLE BLOCK COMPONENT (VISUAL HTML RENDERING)
// ----------------------------------------------------
interface RichEditableBlockProps {
  html: string;
  onChange: (newHtml: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  tagName?: 'div' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'span';
  align?: 'left' | 'center' | 'right' | 'justify';
}

function RichEditableBlock({
  html,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className = '',
  tagName = 'div',
  align,
}: RichEditableBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const lastHtmlRef = useRef(html);

  // Sync incoming HTML changes (from mode switch, undo/redo, toolbar formatting, initial load)
  useEffect(() => {
    if (contentRef.current && html !== lastHtmlRef.current) {
      if (contentRef.current.innerHTML !== (html || '')) {
        contentRef.current.innerHTML = html || '';
      }
      lastHtmlRef.current = html || '';
    }
  }, [html]);

  // Set initial content on mount
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== (html || '')) {
      contentRef.current.innerHTML = html || '';
      lastHtmlRef.current = html || '';
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    const target = e.currentTarget;
    let newHtml = target.innerHTML;

    // Normalizing empty content from browser quirks (e.g. <br>, <p><br></p>)
    if (
      newHtml === '<br>' ||
      newHtml === '<p><br></p>' ||
      newHtml === '<div><br></div>' ||
      newHtml === '<p></p>' ||
      newHtml === '<span></span>'
    ) {
      newHtml = '';
    }

    lastHtmlRef.current = newHtml;
    onChange(newHtml);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // For headings (H2, H3, H4), pressing Enter inserts a soft line break <br> instead of creating a nested block
    if ((tagName === 'h2' || tagName === 'h3' || tagName === 'h4') && e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
      }
    }
  };

  const Tag = tagName as any;

  return (
    <Tag
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={(e: any) => {
        isComposingRef.current = false;
        handleInput(e);
      }}
      data-placeholder={placeholder}
      className={`outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 empty:before:pointer-events-none cursor-text ${
        align === 'center'
          ? 'text-center'
          : align === 'right'
          ? 'text-right'
          : align === 'justify'
          ? 'text-justify'
          : 'text-left'
      } ${className}`}
    />
  );
}

// ----------------------------------------------------
// LIST BLOCK EDITOR (SUPPORTS RICH HTML PER ITEM)
// ----------------------------------------------------
function ListBlockEditor({
  block,
  onChangeContent,
}: {
  block: Block;
  onChangeContent: (content: string) => void;
}) {
  const isBullet = block.type === 'list-bullet';
  const rawItems = (block.content || '').split('\n');
  const items = rawItems.length > 0 && (rawItems.length > 1 || rawItems[0] !== '') ? rawItems : [''];

  const handleItemChange = (index: number, newHtml: string) => {
    const updated = [...items];
    updated[index] = newHtml;
    onChangeContent(updated.join('\n'));
  };

  const handleAddItem = (afterIndex?: number) => {
    const updated = [...items];
    if (typeof afterIndex === 'number') {
      updated.splice(afterIndex + 1, 0, '');
    } else {
      updated.push('');
    }
    onChangeContent(updated.join('\n'));
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      onChangeContent('');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onChangeContent(updated.join('\n'));
  };

  return (
    <div className="space-y-2 my-2 font-serif">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">
          {isBullet ? 'Bullet List' : 'Numbered List'} ({items.length} items)
        </span>
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="text-xs text-pink-600 hover:text-pink-700 font-semibold font-sans flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={`list-item-${index}`} className="flex items-start gap-2.5 group/item">
            <span className="shrink-0 text-stone-400 font-bold text-sm select-none pt-0.5 min-w-4">
              {isBullet ? '•' : `${index + 1}.`}
            </span>
            <div className="flex-1 min-w-0">
              <RichEditableBlock
                html={item}
                onChange={(val) => handleItemChange(index, val)}
                placeholder="List item text..."
                className="w-full text-base sm:text-lg text-stone-800 leading-relaxed min-h-[1.5rem]"
              />
            </div>
            <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 shrink-0 pt-0.5 transition-opacity">
              <button
                type="button"
                onClick={() => handleAddItem(index)}
                className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded transition cursor-pointer"
                title="Insert item below"
              >
                <Plus className="w-3 h-3" />
              </button>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// FAQ BLOCK EDITOR COMPONENT
// ----------------------------------------------------
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
          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Question</span>
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
                  onClick={() => handleMoveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">Question:</label>
              <input
                type="text"
                value={item.question}
                onChange={(e) => handleItemChange(index, 'question', e.target.value)}
                placeholder="e.g. What is the return policy?"
                className="w-full text-xs font-semibold px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-pink-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">Answer:</label>
              <textarea
                value={item.answer}
                onChange={(e) => handleItemChange(index, 'answer', e.target.value)}
                placeholder="Write the comprehensive answer here..."
                rows={2}
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-pink-600 resize-y"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TABLE BLOCK EDITOR COMPONENT
// ----------------------------------------------------
function TableBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const tableData = block.attrs?.tableData || {
    headers: ['Header 1', 'Header 2', 'Header 3'],
    rows: [
      ['Item 1', 'Item 2', 'Item 3'],
      ['Item 4', 'Item 5', 'Item 6'],
    ],
    hasHeader: true,
  };

  const headers = tableData.headers || ['Col 1', 'Col 2'];
  const rows = tableData.rows || [['', '']];
  const hasHeader = tableData.hasHeader !== false;

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((r, ri) =>
      ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? value : c)) : [...r]
    );
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, rows: newRows },
    });
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const newHeaders = headers.map((h, ci) => (ci === colIndex ? value : h));
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, headers: newHeaders },
    });
  };

  const handleAddRow = () => {
    const newRow = new Array(headers.length || (rows[0] ? rows[0].length : 2)).fill('');
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, rows: [...rows, newRow] },
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== rowIndex);
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, rows: newRows },
    });
  };

  const handleAddColumn = () => {
    const newHeaders = [...headers, `Header ${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, '']);
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, headers: newHeaders, rows: newRows },
    });
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, ci) => ci !== colIndex);
    const newRows = rows.map((r) => r.filter((_, ci) => ci !== colIndex));
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, headers: newHeaders, rows: newRows },
    });
  };

  const toggleHeaderRow = () => {
    updateBlockAttrs(block.id, {
      tableData: { ...tableData, hasHeader: !hasHeader },
    });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-pink-600" />
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Table Builder ({rows.length} rows × {headers.length} cols)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHeaderRow}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition cursor-pointer ${
              hasHeader
                ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            Header Row: {hasHeader ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold rounded-md transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-pink-600" />
            <span>Add Col</span>
          </button>
          <button
            type="button"
            onClick={handleAddRow}
            className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-md transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-stone-200 rounded-lg bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          {hasHeader && (
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                {headers.map((head, ci) => (
                  <th key={ci} className="p-2 border-r border-stone-200 last:border-r-0 relative group">
                    <div className="flex items-center justify-between gap-1">
                      <RichEditableBlock
                        html={head}
                        onChange={(val) => handleHeaderChange(ci, val)}
                        className="w-full font-bold text-stone-900 bg-transparent px-1 py-0.5"
                      />
                      {headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(ci)}
                          title="Delete column"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 text-stone-400 hover:text-red-600 rounded transition cursor-pointer shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-8 p-1"></th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-stone-50/50 group">
                {row.map((cell, ci) => (
                  <td key={ci} className="p-2 border-r border-stone-100 last:border-r-0">
                    <RichEditableBlock
                      html={cell}
                      onChange={(val) => handleCellChange(ri, ci, val)}
                      placeholder="Type text..."
                      className="w-full text-stone-700 bg-transparent px-1 py-0.5 min-h-[1.25rem]"
                    />
                  </td>
                ))}
                <td className="w-8 p-1 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(ri)}
                      title="Delete row"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ALSO READ POST PICKER COMPONENT (FEATURE FIXED)
// ----------------------------------------------------
function AlsoReadBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPostId = block.postId || block.attrs?.postId;

  // Load existing selected post
  useEffect(() => {
    if (currentPostId) {
      fetch(`/api/posts/${currentPostId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && !data.error && data.id) {
            setSelectedPost(data);
          }
        })
        .catch(() => {});
    }
  }, [currentPostId]);

  // Fetch 5 most recent articles
  const fetchRecentPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?limit=5&sortBy=publishedAt&sortOrder=desc`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.posts || [];
        setPosts(list);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch search results
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      fetchRecentPosts();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.posts || [];
        setPosts(list);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  // Handle focus / click on search field: show 5 most recent articles
  const handleFocusSearch = () => {
    setIsOpen(true);
    if (posts.length === 0 && !searchQuery) {
      fetchRecentPosts();
    }
  };

  // Handle search query change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsOpen(true);
    fetchSearchResults(val);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPost = (p: Post) => {
    setSelectedPost(p);
    block.postId = p.id;
    updateBlockAttrs(block.id, {
      postId: p.id,
      postTitle: p.title,
      postSlug: p.slug,
      postImage: p.featuredImage,
      postExcerpt: p.excerpt,
    });
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 font-sans" ref={dropdownRef}>
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-600" />
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Also Read Card Interlink
          </span>
        </div>
        {selectedPost && (
          <button
            type="button"
            onClick={() => {
              setSelectedPost(null);
              block.postId = undefined;
              updateBlockAttrs(block.id, {
                postId: undefined,
                postTitle: undefined,
                postSlug: undefined,
                postImage: undefined,
                postExcerpt: undefined,
              });
              setIsOpen(true);
              fetchRecentPosts();
            }}
            className="text-[11px] text-pink-600 hover:underline font-semibold cursor-pointer"
          >
            Change Article
          </button>
        )}
      </div>

      {selectedPost ? (
        <div className="flex items-center gap-3 bg-white p-3 border border-stone-200 rounded-lg shadow-xs">
          {selectedPost.featuredImage && (
            <img
              src={selectedPost.featuredImage}
              alt=""
              className="w-16 h-12 object-cover rounded shrink-0 border border-stone-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
              Selected Recommendation
            </span>
            <p className="text-xs font-serif font-bold text-stone-900 truncate">
              {selectedPost.title}
            </p>
            {selectedPost.category?.name && (
              <span className="text-[10px] text-stone-500">{selectedPost.category.name}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles by keyword (or click to see 5 recent)..."
              value={searchQuery}
              onFocus={handleFocusSearch}
              onClick={handleFocusSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs pl-8 pr-8 py-2 bg-white border border-stone-200 rounded-lg focus:outline-pink-600 focus:border-pink-500"
            />
            {loading && (
              <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Results Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg p-1 space-y-1 max-h-60 overflow-y-auto shadow-lg z-30 divide-y divide-stone-100">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {searchQuery.trim() ? `Search Results (${posts.length})` : 'Recent 5 Articles'}
              </div>
              {posts.length === 0 && !loading && (
                <div className="p-3 text-center text-xs text-stone-400">
                  No articles found matching "{searchQuery}"
                </div>
              )}
              {posts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPost(p)}
                  className="p-2 hover:bg-pink-50/70 rounded-md cursor-pointer transition flex items-center gap-3"
                >
                  {p.featuredImage ? (
                    <img src={p.featuredImage} alt="" className="w-10 h-8 object-cover rounded shrink-0 border border-stone-200" />
                  ) : (
                    <div className="w-10 h-8 bg-stone-100 rounded shrink-0 flex items-center justify-center text-stone-400">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-serif font-bold text-stone-900 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span>{p.category?.name || 'General'}</span>
                      {p.publishedAt && <span>• {new Date(p.publishedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// BETWEEN BLOCK INSERTER COMPONENT (FEATURE FIXED: INSERTS PARAGRAPH DIRECTLY)
// ----------------------------------------------------
function BetweenBlockInserter({
  targetIndex,
  onInsertParagraph,
}: {
  targetIndex: number;
  onInsertParagraph: (index: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full h-5 -my-2.5 flex items-center justify-center group/gap z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full flex items-center justify-center transition-all duration-150 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[2px] bg-pink-500/80 pointer-events-none rounded-full" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInsertParagraph(targetIndex);
          }}
          className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all bg-pink-600 text-white hover:scale-110 cursor-pointer active:scale-95"
          title="Add paragraph block here"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EditableBlockContent({
  blockId,
  content,
  className,
  placeholder,
  setActiveBlockId,
  handleUpdateBlockContent,
}: {
  blockId: string;
  content: string;
  className: string;
  placeholder: string;
  setActiveBlockId: (id: string) => void;
  handleUpdateBlockContent: (id: string, val: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (content || '')) {
      if (document.activeElement !== ref.current) {
        ref.current.innerHTML = content || '';
      }
    }
  }, [content]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => handleUpdateBlockContent(blockId, e.currentTarget.innerHTML)}
      onBlur={(e) => handleUpdateBlockContent(blockId, e.currentTarget.innerHTML)}
      onFocus={() => setActiveBlockId(blockId)}
      data-placeholder={placeholder}
      className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-stone-300 ${className}`}
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || '') }}
    />
  );
}

// ----------------------------------------------------
// CUSTOM BEAUTIFUL DROPDOWN SELECT COMPONENT
// ----------------------------------------------------
export interface DropdownOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function DropdownSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  id,
  disabled = false,
}: {
  value: T;
  onChange: (val: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  id?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-stone-50 hover:bg-stone-100/90 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 cursor-pointer disabled:opacity-50 text-left ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && <span className="shrink-0 text-stone-500">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border ${
                selectedOption.badgeColor || 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-pink-600' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 top-full mt-1 w-full min-w-[220px] max-h-64 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 divide-y-0 ${menuClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-pink-50 text-pink-700 font-bold border border-pink-100 shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {opt.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-pink-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                        {opt.icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="leading-snug break-words">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border shrink-0 ${
                              opt.badgeColor || 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-[10px] text-stone-400 font-normal leading-tight mt-0.5 truncate">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-pink-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// MAIN POST EDITOR COMPONENT
// ----------------------------------------------------
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

  // Categories organization
  const parentCategories = categories.filter((c) => !c.parentId);
  const allSubCategories = categories.filter((c) => Boolean(c.parentId));

  // 1. Post Core State
  const [postId, setPostId] = useState<string>(initialPost?.id || '');
  const [title, setTitle] = useState<string>(initialPost?.title || '');
  const [subtitle, setSubtitle] = useState<string>(initialPost?.excerpt || '');
  const [slug, setSlug] = useState<string>(initialPost?.slug || '');
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Featured Image
  const [featuredImage, setFeaturedImage] = useState<string>(
    initialPost?.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80'
  );
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploadingFeatured, setIsUploadingFeatured] = useState<boolean>(false);

  // Category & Subcategory Synchronization
  const initialCategory = initialPost?.categoryId || parentCategories[0]?.id || categories[0]?.id || '';
  const [categoryId, setCategoryId] = useState<string>(initialCategory);
  const [subCategoryId, setSubCategoryId] = useState<string>(initialPost?.subCategoryId || 'none');

  const [status, setStatus] = useState<string>(initialPost?.status || 'draft');
  // Tracks whether this article is an existing published article
  const [isAlreadyPublished, setIsAlreadyPublished] = useState<boolean>(
    Boolean(initialPost?.id && initialPost?.status === 'published')
  );

  // Synced Primary Action Button label based on Status & Visibility:
  // • Draft -> "Save Draft"
  // • Published -> existing published article: "Update Article"; new/draft article: "Publish"
  // • Scheduled -> "Schedule"
  const getPrimaryButtonLabel = () => {
    if (status === 'draft') {
      return 'Save Draft';
    }
    if (status === 'scheduled') {
      return 'Schedule';
    }
    if (status === 'published') {
      return isAlreadyPublished ? 'Update Article' : 'Publish';
    }
    return 'Save Post';
  };

  const getPrimaryButtonIcon = () => {
    if (isSaving) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    }
    if (status === 'draft') {
      return <Save className="w-3.5 h-3.5" />;
    }
    if (status === 'scheduled') {
      return <Clock className="w-3.5 h-3.5" />;
    }
    return <Send className="w-3.5 h-3.5" />;
  };

  // Flags & Settings
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialPost?.isFeatured));
  const [isTrending, setIsTrending] = useState<boolean>(Boolean(initialPost?.isTrending));
  const [isEditorPick, setIsEditorPick] = useState<boolean>(Boolean(initialPost?.isEditorPick));
  const [allowComments, setAllowComments] = useState<boolean>(initialPost?.allowComments !== false);
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

  // Tag Chips
  const [tagChips, setTagChips] = useState<string[]>(
    initialPost?.tags
      ?.map((t: any) => (typeof t === 'string' ? t : t.name || t.slug || ''))
      .map((s: string) => s.replace(/^#+/, '').trim())
      .filter(Boolean) || []
  );
  const [tagInputValue, setTagInputValue] = useState<string>('');
  const [availableSystemTags, setAvailableSystemTags] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableSystemTags(data);
        }
      })
      .catch(() => {});
  }, []);

  // UI Modes & Drawers
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');
  const [isBlocksDrawerOpen, setIsBlocksDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'post' | 'settings' | 'seo'>('post');
  const [selectedBlockCategory, setSelectedBlockCategory] = useState<'ALL' | 'TEXT' | 'MEDIA' | 'LAYOUT' | 'EMBED'>('ALL');
  const [blockSearchTerm, setBlockSearchTerm] = useState<string>('');

  // HTML Content state
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatusText, setSaveStatusText] = useState<string>('All changes saved');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Active Block tracking
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Link Dialog Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkModalUrl, setLinkModalUrl] = useState<string>('');
  const [linkModalText, setLinkModalText] = useState<string>('');
  const [linkModalNewTab, setLinkModalNewTab] = useState<boolean>(true);

  // Expandable "More Tools" dropdown state
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState<boolean>(false);
  const moreToolsRef = useRef<HTMLDivElement>(null);

  // Selection tracking for inline formatting
  const lastActiveTextSelection = useRef<{
    element: HTMLTextAreaElement | HTMLInputElement | null;
    start: number;
    end: number;
    text: string;
  }>({ element: null, start: 0, end: 0, text: '' });

  // Capture selection helper
  const captureSelection = () => {
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const text = activeEl.value.substring(start, end);
      lastActiveTextSelection.current = { element: activeEl, start, end, text };
      return { element: activeEl, start, end, text };
    }
    return lastActiveTextSelection.current;
  };

  // Close "More Tools" dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setIsMoreToolsOpen(false);
      }
    }
    if (isMoreToolsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreToolsOpen]);

  // Undo / Redo History
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Auto-focus helper function
  const focusBlock = (blockId: string) => {
    setTimeout(() => {
      const container = document.querySelector(`[data-block-id="${blockId}"]`);
      if (container) {
        const inputOrTextarea = container.querySelector('[contenteditable="true"], textarea, input[type="text"]') as HTMLElement | null;
        if (inputOrTextarea) {
          inputOrTextarea.focus();
        }
      }
    }, 60);
  };

  // 2. Load Blocks Initializer
  useEffect(() => {
    let initialBlocks: Block[] = [];
    if (initialPost) {
      if (initialPost.blocks && Array.isArray(initialPost.blocks) && initialPost.blocks.length > 0) {
        initialBlocks = initialPost.blocks;
      } else if (initialPost.content) {
        initialBlocks = parseHtmlToBlocks(initialPost.content);
      } else {
        initialBlocks = [{ id: 'p_init', type: 'paragraph', content: '' }];
      }
    } else {
      initialBlocks = [{ id: 'p_init', type: 'paragraph', content: '' }];
    }
    setBlocks(initialBlocks);
    setHistory([initialBlocks]);
    setHistoryIndex(0);
    if (initialBlocks[0]) {
      setActiveBlockId(initialBlocks[0].id);
    }
  }, [initialPost]);

  // Synchronize category with subcategory on mount if subcategory is set
  useEffect(() => {
    if (subCategoryId && subCategoryId !== 'none') {
      const subCat = categories.find((c) => c.id === subCategoryId);
      if (subCat && subCat.parentId && subCat.parentId !== categoryId) {
        setCategoryId(subCat.parentId);
      }
    }
  }, [subCategoryId, categories]);

  // Handle Primary Category Change
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    setSaveStatusText('Unsaved changes');

    // If currently selected subcategory doesn't belong to this parent, reset it
    if (subCategoryId !== 'none') {
      const currentSub = categories.find((c) => c.id === subCategoryId);
      if (currentSub && currentSub.parentId !== newCatId) {
        setSubCategoryId('none');
      }
    }
  };

  // Handle SubCategory Change (Consistent Synchronization)
  const handleSubCategoryChange = (newSubId: string) => {
    setSubCategoryId(newSubId);
    setSaveStatusText('Unsaved changes');

    if (newSubId && newSubId !== 'none') {
      const subCat = categories.find((c) => c.id === newSubId);
      if (subCat && subCat.parentId) {
        // Automatically sync parent category
        setCategoryId(subCat.parentId);
      }
    }
  };

  // Available subcategories for the selected category
  const availableSubCategories = allSubCategories.filter((sub) =>
    categoryId ? sub.parentId === categoryId : true
  );

  // Push state to Undo History
  const pushToHistory = useCallback((newBlocks: Block[]) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newBlocks];
    });
    setHistoryIndex((prev) => prev + 1);
    setSaveStatusText('Unsaved changes');
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setBlocks(history[targetIndex]);
      setHistoryIndex(targetIndex);
      if (history[targetIndex][0]) {
        setActiveBlockId(history[targetIndex][0].id);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setBlocks(history[targetIndex]);
      setHistoryIndex(targetIndex);
      if (history[targetIndex][0]) {
        setActiveBlockId(history[targetIndex][0].id);
      }
    }
  };

  // Sync title with Slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSaveStatusText('Unsaved changes');
    if (!initialPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setSeoTitle(val);
    }
  };

  // Switch to HTML mode
  const handleSwitchToHtml = () => {
    const serialized = serializeBlocksToHtml(blocks);
    setHtmlContent(serialized);
    setEditMode('html');
  };

  // Switch to Visual mode
  const handleSwitchToVisual = () => {
    const parsed = parseHtmlToBlocks(htmlContent);
    setBlocks(parsed);
    pushToHistory(parsed);
    setEditMode('visual');
  };

  // Add / Insert Block from Drawer
  const handleAddBlock = (type: BlockType, targetIdx?: number) => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === type);
    const newBlock: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: type,
      content: '',
      attrs: catalogItem?.defaultAttrs ? JSON.parse(JSON.stringify(catalogItem.defaultAttrs)) : {},
    };

    let updatedBlocks: Block[];
    const idx = targetIdx !== undefined ? targetIdx : blocks.length;

    if (idx >= 0 && idx <= blocks.length) {
      updatedBlocks = [...blocks.slice(0, idx), newBlock, ...blocks.slice(idx)];
    } else {
      updatedBlocks = [...blocks, newBlock];
    }

    setBlocks(updatedBlocks);
    pushToHistory(updatedBlocks);
    setActiveBlockId(newBlock.id);
    setIsBlocksDrawerOpen(false);
    focusBlock(newBlock.id);
  };

  // Direct Insert Paragraph (Used by "+" between blocks and "Add New Block" at bottom)
  const handleInsertParagraph = (targetIdx: number) => {
    const newBlock: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'paragraph',
      content: '',
      attrs: {},
    };

    const updatedBlocks = [...blocks.slice(0, targetIdx), newBlock, ...blocks.slice(targetIdx)];
    setBlocks(updatedBlocks);
    pushToHistory(updatedBlocks);
    setActiveBlockId(newBlock.id);
    focusBlock(newBlock.id);
  };

  // Update Block Content
  const handleUpdateBlockContent = (id: string, content: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    setBlocks(updated);
    setSaveStatusText('Unsaved changes');
  };

  // Update Block Attrs
  const handleUpdateBlockAttrs = (id: string, newAttrs: any) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, attrs: { ...b.attrs, ...newAttrs } } : b
    );
    setBlocks(updated);
    setSaveStatusText('Unsaved changes');
  };

  // Delete Block
  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      const reset = [{ id: `p_${Date.now()}`, type: 'paragraph' as BlockType, content: '' }];
      setBlocks(reset);
      pushToHistory(reset);
      setActiveBlockId(reset[0].id);
      return;
    }
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    pushToHistory(updated);
    if (activeBlockId === id && updated.length > 0) {
      setActiveBlockId(updated[0].id);
    }
  };

  // Move Block Up / Down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
    pushToHistory(updated);
  };

  // Duplicate Block
  const handleDuplicateBlock = (id: string) => {
    const blockIndex = blocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) return;
    const original = blocks[blockIndex];
    const duplicate: Block = {
      ...JSON.parse(JSON.stringify(original)),
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [
      ...blocks.slice(0, blockIndex + 1),
      duplicate,
      ...blocks.slice(blockIndex + 1),
    ];
    setBlocks(updated);
    pushToHistory(updated);
    setActiveBlockId(duplicate.id);
  };

  // Change Block Type (Preserving content)
  const handleChangeBlockType = (id: string, newType: BlockType) => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === newType);
    const updated = blocks.map((b) => {
      if (b.id === id) {
        let newAttrs = catalogItem?.defaultAttrs ? JSON.parse(JSON.stringify(catalogItem.defaultAttrs)) : {};
        if (b.attrs) {
          newAttrs = { ...newAttrs, ...b.attrs };
        }
        return {
          ...b,
          type: newType,
          attrs: newAttrs,
        };
      }
      return b;
    });
    setBlocks(updated);
    pushToHistory(updated);
    setActiveBlockId(id);
    focusBlock(id);
  };

  // Open Link Inserter/Editor Dialog
  const handleOpenLinkModal = () => {
    const sel = captureSelection();
    setLinkModalText(sel.text || '');
    // If selected text or block has a link, extract URL if present
    const urlMatch = sel.text.match(/href=["'](.*?)["']/i);
    setLinkModalUrl(urlMatch ? urlMatch[1] : '');
    setLinkModalNewTab(true);
    setIsLinkModalOpen(true);
  };

  // Apply Link Dialog
  const handleApplyLinkModal = () => {
    if (!linkModalUrl) {
      setIsLinkModalOpen(false);
      return;
    }
    let formattedUrl = linkModalUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#') && !formattedUrl.startsWith('mailto:')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    applyInlineFormatting('link', {
      url: formattedUrl,
      text: linkModalText,
      newTab: linkModalNewTab,
    });
    setIsLinkModalOpen(false);
  };

  // Remove Link
  const handleRemoveLink = () => {
    applyInlineFormatting('unlink');
    setIsLinkModalOpen(false);
  };

  // Set Alignment on Active Block
  const handleSetBlockAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
    if (!targetId) return;
    handleUpdateBlockAttrs(targetId, { align });
  };

  // Selection-aware inline formatting helper
  const applyInlineFormatting = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'del' | 'sub' | 'sup' | 'small' | 'br' | 'code' | 'clear' | 'highlight' | 'link' | 'unlink',
    payload?: any
  ) => {
    const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
    if (!targetId) return;
    const block = blocks.find((b) => b.id === targetId);
    if (!block) return;

    if (format === 'clear') {
      // Clear formatting: strip all HTML tags & markdown markers, reset alignment to left
      const rawContent = (block.content || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/__(.*?)__/g, '$1');
      handleUpdateBlockContent(block.id, rawContent);
      handleUpdateBlockAttrs(block.id, { align: 'left' });
      return;
    }

    // 1. Try contentEditable selection in the active block
    const blockContainer = document.querySelector(`[data-block-id="${targetId}"]`);
    const activeEditable = (blockContainer?.querySelector('[contenteditable="true"]') as HTMLElement) || (document.activeElement?.closest('[contenteditable="true"]') as HTMLElement);

    if (activeEditable) {
      activeEditable.focus();
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;

      switch (format) {
        case 'bold':
          document.execCommand('bold', false);
          break;
        case 'italic':
          document.execCommand('italic', false);
          break;
        case 'underline':
          document.execCommand('underline', false);
          break;
        case 'strikethrough':
        case 'del':
          document.execCommand('strikeThrough', false);
          break;
        case 'sub':
          document.execCommand('subscript', false);
          break;
        case 'sup':
          document.execCommand('superscript', false);
          break;
        case 'small':
          if (hasSelection && selection) {
            const range = selection.getRangeAt(0);
            const wrapper = document.createElement('small');
            wrapper.appendChild(range.extractContents());
            range.insertNode(wrapper);
          } else {
            document.execCommand('insertHTML', false, '<small>small text</small>');
          }
          break;
        case 'br':
          document.execCommand('insertHTML', false, '<br>');
          break;
        case 'code':
          if (hasSelection && selection) {
            const range = selection.getRangeAt(0);
            const wrapper = document.createElement('code');
            wrapper.className = 'font-mono text-xs bg-stone-100 text-pink-700 px-1 py-0.5 rounded';
            wrapper.appendChild(range.extractContents());
            range.insertNode(wrapper);
          } else {
            document.execCommand('insertHTML', false, '<code class="font-mono text-xs bg-stone-100 text-pink-700 px-1 py-0.5 rounded">code</code>');
          }
          break;
        case 'highlight': {
          const bg = payload?.color || '#fef08a';
          if (hasSelection && selection) {
            const range = selection.getRangeAt(0);
            const wrapper = document.createElement('mark');
            wrapper.style.backgroundColor = bg;
            wrapper.style.padding = '0 4px';
            wrapper.style.borderRadius = '4px';
            wrapper.appendChild(range.extractContents());
            range.insertNode(wrapper);
          } else {
            document.execCommand('insertHTML', false, `<mark style="background-color: ${bg}; padding: 0 4px; border-radius: 4px;">highlighted text</mark>`);
          }
          break;
        }
        case 'link': {
          const url = payload?.url || '#';
          const linkTxt = payload?.text;
          const targetBlank = payload?.newTab;
          if (linkTxt && hasSelection && selection) {
            const range = selection.getRangeAt(0);
            const link = document.createElement('a');
            link.href = url;
            if (targetBlank) {
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
            }
            link.className = 'text-pink-600 underline font-medium';
            link.textContent = linkTxt;
            range.deleteContents();
            range.insertNode(link);
          } else if (hasSelection && selection) {
            document.execCommand('createLink', false, url);
            if (targetBlank) {
              const range = selection.getRangeAt(0);
              const parentLink = range.commonAncestorContainer.parentElement?.closest('a');
              if (parentLink) {
                parentLink.target = '_blank';
                parentLink.rel = 'noopener noreferrer';
                parentLink.className = 'text-pink-600 underline font-medium';
              }
            }
          } else {
            const linkHtml = `<a href="${url}"${targetBlank ? ' target="_blank" rel="noopener noreferrer"' : ''} class="text-pink-600 underline font-medium">${linkTxt || 'link'}</a>`;
            document.execCommand('insertHTML', false, linkHtml);
          }
          break;
        }
        case 'unlink':
          document.execCommand('unlink', false);
          break;
      }

      handleUpdateBlockContent(block.id, activeEditable.innerHTML);
      return;
    }

    // 2. Fallback for textarea/input elements if any
    const sel = lastActiveTextSelection.current;
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
    const el = (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) ? activeEl : sel.element;

    if (el && el.selectionStart !== undefined && el.selectionEnd !== undefined && el.selectionStart !== el.selectionEnd) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const value = el.value;
      const selectedText = value.substring(start, end);

      let replacement = '';
      switch (format) {
        case 'bold':
          replacement = selectedText ? `<strong>${selectedText}</strong>` : '<strong>bold text</strong>';
          break;
        case 'italic':
          replacement = selectedText ? `<em>${selectedText}</em>` : '<em>italic text</em>';
          break;
        case 'underline':
          replacement = selectedText ? `<u>${selectedText}</u>` : '<u>underlined text</u>';
          break;
        case 'strikethrough':
          replacement = selectedText ? `<s>${selectedText}</s>` : '<s>strikethrough text</s>';
          break;
        case 'del':
          replacement = selectedText ? `<del>${selectedText}</del>` : '<del>deleted text</del>';
          break;
        case 'sub':
          replacement = selectedText ? `<sub>${selectedText}</sub>` : '<sub>subscript</sub>';
          break;
        case 'sup':
          replacement = selectedText ? `<sup>${selectedText}</sup>` : '<sup>superscript</sup>';
          break;
        case 'small':
          replacement = selectedText ? `<small>${selectedText}</small>` : '<small>small text</small>';
          break;
        case 'br':
          replacement = `<br>`;
          break;
        case 'code':
          replacement = selectedText ? `<code>${selectedText}</code>` : '<code>code snippet</code>';
          break;
        case 'highlight': {
          const bg = payload?.color || '#fef08a';
          replacement = `<mark style="background-color: ${bg}; padding: 0 4px; border-radius: 4px;">${selectedText || 'highlighted text'}</mark>`;
          break;
        }
        case 'link': {
          const url = payload?.url || '#';
          const linkTxt = payload?.text || selectedText || 'link';
          const targetBlank = payload?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
          replacement = `<a href="${url}"${targetBlank}>${linkTxt}</a>`;
          break;
        }
        case 'unlink':
          replacement = selectedText.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
          break;
      }

      const newContent = value.substring(0, start) + replacement + value.substring(end);
      handleUpdateBlockContent(block.id, newContent);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      }, 50);
    } else {
      // 3. Fallback when nothing is focused or selected: wrap block content
      const current = block.content || '';
      let newContent = current;
      switch (format) {
        case 'bold':
          newContent = current ? `<strong>${current}</strong>` : '<strong>bold text</strong>';
          break;
        case 'italic':
          newContent = current ? `<em>${current}</em>` : '<em>italic text</em>';
          break;
        case 'underline':
          newContent = current ? `<u>${current}</u>` : '<u>underlined text</u>';
          break;
        case 'strikethrough':
          newContent = current ? `<s>${current}</s>` : '<s>strikethrough text</s>';
          break;
        case 'del':
          newContent = current ? `<del>${current}</del>` : '<del>deleted text</del>';
          break;
        case 'sub':
          newContent = current ? `<sub>${current}</sub>` : '<sub>subscript</sub>';
          break;
        case 'sup':
          newContent = current ? `<sup>${current}</sup>` : '<sup>superscript</sup>';
          break;
        case 'small':
          newContent = current ? `<small>${current}</small>` : '<small>small text</small>';
          break;
        case 'br':
          newContent = current + `<br>`;
          break;
        case 'code':
          newContent = current ? `<code>${current}</code>` : '<code>code snippet</code>';
          break;
        case 'highlight': {
          const bg = payload?.color || '#fef08a';
          newContent = current
            ? `<mark style="background-color: ${bg}; padding: 0 4px; border-radius: 4px;">${current}</mark>`
            : `<mark style="background-color: ${bg}; padding: 0 4px; border-radius: 4px;">highlighted text</mark>`;
          break;
        }
        case 'link': {
          const url = payload?.url || '#';
          const linkTxt = payload?.text || current || 'link';
          const targetBlank = payload?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
          newContent = `<a href="${url}"${targetBlank}>${linkTxt}</a>`;
          break;
        }
        case 'unlink':
          newContent = current.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
          break;
      }
      handleUpdateBlockContent(block.id, newContent);
    }
  };

  // Tag Management
  const handleAddTag = (rawInput: string) => {
    if (!rawInput) return;
    const parts = rawInput.split(/[,，\n]+/);
    const added: string[] = [];
    for (const part of parts) {
      const clean = part.trim().replace(/^#+/, '').trim();
      if (clean && !tagChips.includes(clean) && !added.includes(clean)) {
        added.push(clean);
      }
    }
    if (added.length > 0) {
      setTagChips([...tagChips, ...added]);
    }
    setTagInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagChips(tagChips.filter((t) => t !== tagToRemove));
  };

  // Upload Featured Image
  const handleUploadFeaturedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('folder', 'naya_andaaz_articles');

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload featured image');
      }

      if (data.url) {
        setFeaturedImage(data.url);
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsUploadingFeatured(false);
    }
  };

  // Paste / Set Featured Image from URL
  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFeaturedImage(imageUrlInput.trim());
      setImageUrlInput('');
    }
  };

  // Save Post to API
  const handleSavePost = async (targetStatus?: string) => {
    if (!title.trim()) {
      setErrorMsg('Please enter an article title');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    setSaveStatusText('Saving...');

    try {
      const compiledContent = editMode === 'html' ? htmlContent : serializeBlocksToHtml(blocks);
      const effectiveStatus = targetStatus || status;

      // Calculate scheduled date if status is scheduled
      let scheduledIso: string | undefined = undefined;
      if (effectiveStatus === 'scheduled') {
        if (!publishedAtLocal) {
          const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const defaultIso = defaultDate.toISOString();
          setPublishedAtLocal(defaultIso.slice(0, 16));
          scheduledIso = defaultIso;
        } else {
          scheduledIso = new Date(publishedAtLocal).toISOString();
        }
      }

      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: compiledContent,
        blocks: blocks,
        excerpt: subtitle,
        featuredImage,
        categoryId,
        subCategoryId: subCategoryId === 'none' ? null : subCategoryId,
        status: effectiveStatus,
        isFeatured,
        isTrending,
        isEditorPick,
        allowComments,
        authorId,
        seoTitle: seoTitle || title,
        metaDescription: metaDescription || subtitle,
        focusKeyword,
        canonicalUrl,
        ogImage: ogImage || featuredImage,
        tags: tagChips.map((t) => t.replace(/^#+/, '').trim()).filter(Boolean),
        tagNames: tagChips.map((t) => t.replace(/^#+/, '').trim()).filter(Boolean),
        scheduledAt: scheduledIso,
        publishedAt:
          effectiveStatus === 'scheduled'
            ? scheduledIso
            : effectiveStatus === 'published'
            ? publishedAtLocal
              ? new Date(publishedAtLocal).toISOString()
              : new Date().toISOString()
            : undefined,
      };

      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      if (!postId && data.post?.id) {
        setPostId(data.post.id);
      } else if (!postId && data.id) {
        setPostId(data.id);
      }
      if (targetStatus) {
        setStatus(targetStatus);
      }

      setSaveStatusText('All changes saved');
      if (effectiveStatus === 'published') {
        setSuccessMsg(isAlreadyPublished ? 'Article updated successfully!' : 'Article published successfully!');
        setIsAlreadyPublished(true);
      } else if (effectiveStatus === 'scheduled') {
        setSuccessMsg('Article scheduled successfully!');
      } else {
        setSuccessMsg('Draft saved successfully!');
        setIsAlreadyPublished(false);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
      setSaveStatusText('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Word Count & Stats
  const totalWords = blocks.reduce((acc, b) => {
    const text = b.content || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, title.trim().split(/\s+/).filter(Boolean).length);

  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  // Active Block Helper
  const currentActiveBlock = blocks.find((b) => b.id === activeBlockId) || blocks[0];

  // Filter Catalog for Left Drawer
  const filteredCatalog = BLOCK_CATALOG.filter((item) => {
    const matchesCategory = selectedBlockCategory === 'ALL' || item.category === selectedBlockCategory;
    const query = blockSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900 font-sans select-none-headers">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER BAR                                    */}
      {/* ---------------------------------------------------- */}
      <header className="shrink-0 bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-xs z-40">
        {/* Left: Back, Title, Status & Autosave Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(defaultBack)}
            className="p-2 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg transition cursor-pointer"
            title="Back to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:block h-5 w-[1px] bg-stone-200" />

          <div className="flex items-center gap-2.5">
            <span className="font-bold text-stone-900 text-sm tracking-tight">
              {postId ? 'Edit Article' : 'New Article'}
            </span>

            {/* Status Badge */}
            <span
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'scheduled'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {status}
            </span>

            {/* Autosave Status Indicator */}
            <span className="hidden md:flex items-center gap-1.5 text-xs text-stone-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
              <span>{saveStatusText}</span>
            </span>
          </div>
        </div>

        {/* Right: Preview, Save Draft, Publish, Settings Toggle */}
        <div className="flex items-center gap-2">
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              showPreview
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Secondary Save Draft Button (available when primary action is not already Save Draft) */}
          {status !== 'draft' && (
            <button
              id="header-save-draft-btn"
              type="button"
              onClick={() => handleSavePost('draft')}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Save as Draft"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          )}

          {/* Top Primary Action Button (synchronized with Status & Visibility) */}
          <button
            id="primary-post-action-btn"
            type="button"
            onClick={() => handleSavePost(status)}
            disabled={isSaving}
            className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {getPrimaryButtonIcon()}
            <span>{getPrimaryButtonLabel()}</span>
          </button>

          <div className="h-5 w-[1px] bg-stone-200 mx-1" />

          {/* Settings Panel Toggle */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isSettingsOpen
                ? 'bg-pink-50 border-pink-200 text-pink-600'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Toggle Settings Panel"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. SECONDARY FORMATTING & BLOCK SWITCHER TOOLBAR     */}
      {/* ---------------------------------------------------- */}
      <div className="shrink-0 bg-white border-b border-stone-200 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs relative z-30 overflow-visible">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Add Blocks Button */}
          <button
            type="button"
            onClick={() => setIsBlocksDrawerOpen(!isBlocksDrawerOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isBlocksDrawerOpen
                ? 'bg-pink-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
            title="Toggle Add Blocks catalog sidebar"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          <div className="h-4 w-[1px] bg-stone-200 mx-1" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-stone-100 text-stone-600 rounded disabled:opacity-30 transition cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-stone-100 text-stone-600 rounded disabled:opacity-30 transition cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 mx-1" />

          {/* Active Block Selector Dropdown (Block Type Switcher) */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 hidden lg:inline">
              Type:
            </span>
            <DropdownSelect<BlockType>
              value={currentActiveBlock?.type || 'paragraph'}
              onChange={(newType) => {
                const targetIdk = activeBlockId || (blocks[0] ? blocks[0].id : null);
                if (targetIdk) {
                  handleChangeBlockType(targetIdk, newType);
                }
              }}
              options={BLOCK_CATALOG.map((item) => ({
                value: item.type as BlockType,
                label: item.name,
                icon: item.icon,
                sublabel: item.description,
                badge: item.category,
                badgeColor:
                  item.category === 'TEXT'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : item.category === 'MEDIA'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : item.category === 'LAYOUT'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200',
              }))}
              className="w-44 sm:w-52"
              buttonClassName="py-1 px-2.5 bg-stone-50 border-stone-200 text-xs font-semibold"
              menuClassName="w-64 max-h-72"
            />
          </div>

          <div className="h-4 w-[1px] bg-stone-200 mx-1 hidden sm:block" />

          {/* Primary Text Styling: Bold, Italic, Underline, Strikethrough, Link */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormatting('bold')}
              className="p-1.5 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded transition cursor-pointer font-bold text-xs"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormatting('italic')}
              className="p-1.5 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded transition cursor-pointer italic text-xs"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormatting('underline')}
              className="p-1.5 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded transition cursor-pointer text-xs"
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormatting('strikethrough')}
              className="p-1.5 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded transition cursor-pointer text-xs"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenLinkModal}
              className="p-1.5 hover:bg-pink-50 text-stone-700 hover:text-pink-600 rounded transition cursor-pointer text-xs"
              title="Insert / Edit Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 mx-1 hidden md:block" />

          {/* Text Alignment Controls */}
          <div className="hidden md:flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSetBlockAlign('left')}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                (!currentActiveBlock?.attrs?.align || currentActiveBlock?.attrs?.align === 'left')
                  ? 'bg-stone-200/80 text-stone-900 font-bold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSetBlockAlign('center')}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.attrs?.align === 'center'
                  ? 'bg-stone-200/80 text-stone-900 font-bold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSetBlockAlign('right')}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.attrs?.align === 'right'
                  ? 'bg-stone-200/80 text-stone-900 font-bold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSetBlockAlign('justify')}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.attrs?.align === 'justify'
                  ? 'bg-stone-200/80 text-stone-900 font-bold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Align Justify"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 mx-1 hidden lg:block" />

          {/* Quick List / Block Type Switchers */}
          <div className="hidden lg:flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
                if (targetId) handleChangeBlockType(targetId, 'list-bullet');
              }}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.type === 'list-bullet'
                  ? 'bg-pink-100 text-pink-700'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
                if (targetId) handleChangeBlockType(targetId, 'list-number');
              }}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.type === 'list-number'
                  ? 'bg-pink-100 text-pink-700'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
                if (targetId) handleChangeBlockType(targetId, 'quote');
              }}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.type === 'quote'
                  ? 'bg-pink-100 text-pink-700'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const targetId = activeBlockId || (blocks[0] ? blocks[0].id : null);
                if (targetId) handleChangeBlockType(targetId, 'code');
              }}
              className={`p-1.5 rounded transition cursor-pointer text-xs ${
                currentActiveBlock?.type === 'code'
                  ? 'bg-pink-100 text-pink-700'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Code Block"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 mx-1" />

          {/* Expandable "More" Tools Popover */}
          <div className="relative z-40" ref={moreToolsRef}>
            <button
              type="button"
              onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                isMoreToolsOpen
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
              title="More formatting tools & block insertion"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">More</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMoreToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 sm:left-auto right-0 sm:right-auto top-full mt-1.5 w-72 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50 space-y-3"
                >
                  {/* Clear Formatting */}
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1.5">
                      Formatting
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        applyInlineFormatting('clear');
                        setIsMoreToolsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer font-medium"
                    >
                      <Eraser className="w-3.5 h-3.5 text-stone-500" />
                      <span>Clear All Formatting</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyInlineFormatting('code');
                        setIsMoreToolsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer font-medium"
                    >
                      <Code className="w-3.5 h-3.5 text-stone-500" />
                      <span>Inline Code Snippet</span>
                    </button>
                  </div>

                  {/* Text Highlight Markers */}
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1.5">
                      Text Highlighter
                    </div>
                    <div className="flex items-center gap-1 px-1.5">
                      {[
                        { name: 'Yellow', color: '#fef08a' },
                        { name: 'Pink', color: '#fbcfe8' },
                        { name: 'Green', color: '#bbf7d0' },
                        { name: 'Blue', color: '#bfdbfe' },
                        { name: 'Orange', color: '#fed7aa' },
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            applyInlineFormatting('highlight', { color: item.color });
                            setIsMoreToolsOpen(false);
                          }}
                          style={{ backgroundColor: item.color }}
                          className="w-6 h-6 rounded-md border border-stone-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title={`Highlight ${item.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Insert Elements */}
                  <div className="pt-1 border-t border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1.5">
                      Insert Element
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('table');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-stone-500" />
                        <span>Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('separator');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 text-stone-500" />
                        <span>Divider</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('spacer');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-stone-500" />
                        <span>Spacer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('button');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                        <span>Button</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('columns');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Columns className="w-3.5 h-3.5 text-stone-500" />
                        <span>Columns</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('code');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-stone-500" />
                        <span>Code</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('embed');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-stone-500" />
                        <span>Embed</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddBlock('html');
                          setIsMoreToolsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-stone-700 hover:bg-pink-50 hover:text-pink-600 rounded-md transition cursor-pointer"
                      >
                        <Code className="w-3.5 h-3.5 text-stone-500" />
                        <span>HTML</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Word Count, Reading Time & Visual / HTML Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{totalWords} words</span>
            <span>•</span>
            <span>{readingTimeMinutes} min read</span>
          </div>

          {/* Visual / HTML Switch */}
          <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => editMode === 'html' && handleSwitchToVisual()}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                editMode === 'visual'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => editMode === 'visual' && handleSwitchToHtml()}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                editMode === 'html'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              HTML
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ALERTS / MESSAGES                                    */}
      {/* ---------------------------------------------------- */}
      {errorMsg && (
        <div className="shrink-0 mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="shrink-0 mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MAIN WORKSPACE WITH INDEPENDENT FIXED SIDEBARS     */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* ==================================================== */}
        {/* LEFT "ADD BLOCKS" SIDEBAR (STAYS FIXED / STICKY)     */}
        {/* ==================================================== */}
        <AnimatePresence>
          {isBlocksDrawerOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="bg-white border-r border-stone-200 h-full overflow-y-auto z-20 flex flex-col shrink-0"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-50/50">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-600" />
                  <h3 className="font-bold text-stone-900 text-sm">Add Blocks</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBlocksDrawerOpen(false)}
                  className="p-1 hover:bg-stone-200 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Category Tabs */}
              <div className="p-3.5 border-b border-stone-100 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={blockSearchTerm}
                    onChange={(e) => setBlockSearchTerm(e.target.value)}
                    placeholder="Search block types..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-pink-600 font-sans"
                  />
                </div>

                <div className="flex gap-1 mt-2.5 overflow-x-auto pb-1">
                  {(['ALL', 'TEXT', 'MEDIA', 'LAYOUT', 'EMBED'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBlockCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition shrink-0 cursor-pointer ${
                        selectedBlockCategory === cat
                          ? 'bg-pink-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog List */}
              <div className="p-3.5 flex-1 overflow-y-auto space-y-4">
                {(['TEXT', 'MEDIA', 'LAYOUT', 'EMBED'] as const).map((cat) => {
                  const itemsInCat = filteredCatalog.filter((item) => item.category === cat);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <span className="text-[10px] font-extrabold tracking-wider text-stone-400 uppercase">
                        {cat}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {itemsInCat.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => handleAddBlock(item.type)}
                            className="p-2.5 bg-white hover:bg-pink-50/50 border border-stone-200 hover:border-pink-300 rounded-xl transition text-left flex flex-col gap-1.5 shadow-2xs group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-pink-100 flex items-center justify-center transition">
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 text-xs group-hover:text-pink-600 transition">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-stone-500 line-clamp-1 leading-tight">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* CENTER WRITING CANVAS (SCROLLS INDEPENDENTLY)        */}
        {/* ==================================================== */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-stone-100/70 p-3 sm:p-6 md:p-8 flex justify-center items-start">
          <div className="w-full max-w-3xl bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-12 shadow-xs min-h-full h-fit flex flex-col mb-16">
            {editMode === 'html' ? (
              /* ---------------- HTML CODE MODE ---------------- */
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Raw Article HTML Editor
                  </span>
                  <span className="text-xs text-stone-400">
                    Changes will synchronize back to visual blocks
                  </span>
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full flex-1 min-h-[500px] font-mono text-xs p-4 bg-stone-900 text-stone-100 rounded-xl focus:outline-pink-600 resize-y"
                  placeholder="<h2>Heading</h2><p>Article content here...</p>"
                />
              </div>
            ) : (
              /* ---------------- VISUAL BLOCKS MODE ------------ */
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Article Title Input */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Add a catchy title here..."
                    className="w-full text-2xl sm:text-4xl font-serif font-black text-stone-900 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0 bg-transparent"
                  />
                </div>

                {/* Article Subtitle / Excerpt Input */}
                <div>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => {
                      setSubtitle(e.target.value);
                      setSaveStatusText('Unsaved changes');
                    }}
                    placeholder="Write a compelling subtitle or excerpt (optional)..."
                    className="w-full text-sm sm:text-base font-serif italic text-stone-600 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0 bg-transparent"
                  />
                </div>

                <hr className="border-stone-100 my-2" />

                {/* Blocks List */}
                <div className="space-y-2 flex-1">
                  {blocks.map((block, index) => {
                    const isActive = activeBlockId === block.id;

                    return (
                      <React.Fragment key={block.id}>
                        {/* Between Block Inserter: directly inserts a Paragraph block */}
                        <BetweenBlockInserter
                          targetIndex={index}
                          onInsertParagraph={handleInsertParagraph}
                        />

                        {/* Block Wrapper */}
                        <div
                          data-block-id={block.id}
                          onClick={() => setActiveBlockId(block.id)}
                          className={`relative rounded-xl transition-all duration-150 group/block p-2.5 ${
                            isActive
                              ? 'ring-2 ring-pink-500 bg-pink-50/20 shadow-xs'
                              : 'hover:bg-stone-50/70'
                          }`}
                        >
                          {/* Floating Block Action Toolbar (Top-Right of Block) */}
                          <div
                            className={`absolute right-2 -top-3.5 z-20 flex items-center gap-1 bg-white border border-stone-200 shadow-md rounded-lg px-1.5 py-0.5 transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
                            }`}
                          >
                            {/* Block Type Switcher in Floating Toolbar */}
                            <select
                              value={block.type}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleChangeBlockType(block.id, e.target.value as BlockType);
                              }}
                              className="text-[10px] font-bold uppercase bg-stone-100 hover:bg-stone-200 text-stone-700 rounded px-1.5 py-0.5 border-none outline-none cursor-pointer"
                              title="Change Block Type"
                            >
                              <option value="paragraph">¶ Paragraph</option>
                              <option value="heading-h2">H2 Heading 2</option>
                              <option value="heading-h3">H3 Heading 3</option>
                              <option value="heading-h4">H4 Heading 4</option>
                              <option value="quote">❝ Quote</option>
                              <option value="list-bullet">≔ Bullet List</option>
                              <option value="list-number">≕ Numbered List</option>
                              <option value="code">&lt;/&gt; Code Block</option>
                              <option value="table">⊞ Table</option>
                              <option value="image">🖼 Image</option>
                              <option value="gallery">▦ Gallery</option>
                              <option value="video">▶ Video</option>
                              <option value="youtube">▶ YouTube</option>
                              <option value="audio">🎵 Audio</option>
                              <option value="button">⬚ Button CTA</option>
                              <option value="columns">▥ Two Columns</option>
                              <option value="separator">― Divider</option>
                              <option value="spacer">↕ Spacer</option>
                              <option value="embed">🔗 Embed</option>
                              <option value="table-of-contents">📑 TOC</option>
                              <option value="alsoRead">📖 Also Read</option>
                              <option value="faq">❓ FAQ</option>
                              <option value="html">&lt;/&gt; HTML</option>
                            </select>

                            <div className="h-3 w-[1px] bg-stone-200 mx-0.5" />

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(index, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                              title="Move block up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBlock(index, 'down');
                              }}
                              disabled={index === blocks.length - 1}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                              title="Move block down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateBlock(block.id);
                              }}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500 cursor-pointer"
                              title="Duplicate block"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(block.id);
                              }}
                              className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                              title="Delete block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* ---------------- RENDER BLOCK TYPES ---------------- */}
                          {/* PARAGRAPH */}
                          {block.type === 'paragraph' && (
                            <RichEditableBlock
                              html={block.content}
                              onChange={(val) => handleUpdateBlockContent(block.id, val)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Start typing your paragraph prose..."
                              align={block.attrs?.align}
                              className="w-full text-base sm:text-lg font-serif text-stone-800 leading-relaxed min-h-[1.75rem]"
                            />
                          )}

                          {/* HEADING 2 */}
                          {block.type === 'heading-h2' && (
                            <RichEditableBlock
                              tagName="h2"
                              html={block.content}
                              onChange={(val) => handleUpdateBlockContent(block.id, val)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 2 Title..."
                              align={block.attrs?.align}
                              className="w-full text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug min-h-[2rem]"
                            />
                          )}

                          {/* HEADING 3 */}
                          {block.type === 'heading-h3' && (
                            <RichEditableBlock
                              tagName="h3"
                              html={block.content}
                              onChange={(val) => handleUpdateBlockContent(block.id, val)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 3 Subsection..."
                              align={block.attrs?.align}
                              className="w-full text-xl sm:text-2xl font-serif font-bold text-stone-800 leading-snug min-h-[1.75rem]"
                            />
                          )}

                          {/* HEADING 4 */}
                          {block.type === 'heading-h4' && (
                            <RichEditableBlock
                              tagName="h4"
                              html={block.content}
                              onChange={(val) => handleUpdateBlockContent(block.id, val)}
                              onFocus={() => setActiveBlockId(block.id)}
                              placeholder="Heading 4 Minor Section..."
                              align={block.attrs?.align}
                              className="w-full text-lg font-serif font-bold text-stone-800 leading-snug min-h-[1.5rem]"
                            />
                          )}

                          {/* QUOTE */}
                          {block.type === 'quote' && (
                            <div
                              className={`border-l-4 border-pink-500 pl-4 py-2 my-2 bg-pink-50/30 rounded-r-xl space-y-2 ${
                                block.attrs?.align === 'center'
                                  ? 'text-center border-l-0 border-t-2 border-pink-500 rounded-xl'
                                  : block.attrs?.align === 'right'
                                  ? 'text-right border-l-0 border-r-4 border-pink-500 pr-4 pl-0 rounded-l-xl rounded-r-none'
                                  : ''
                              }`}
                            >
                              <RichEditableBlock
                                html={block.content}
                                onChange={(val) => handleUpdateBlockContent(block.id, val)}
                                onFocus={() => setActiveBlockId(block.id)}
                                placeholder="Enter pull quote text..."
                                align={block.attrs?.align}
                                className="w-full font-serif italic text-lg text-stone-800 min-h-[1.75rem]"
                              />
                              <input
                                type="text"
                                value={block.attrs?.author || ''}
                                onChange={(e) => handleUpdateBlockAttrs(block.id, { author: e.target.value })}
                                placeholder="— Author name / source (optional)"
                                className={`w-full text-xs font-semibold text-stone-500 placeholder:text-stone-400 border-none outline-none bg-transparent ${
                                  block.attrs?.align === 'center'
                                    ? 'text-center'
                                    : block.attrs?.align === 'right'
                                    ? 'text-right'
                                    : 'text-left'
                                }`}
                              />
                            </div>
                          )}

                          {/* LIST (BULLET / NUMBERED) */}
                          {(block.type === 'list-bullet' || block.type === 'list-number') && (
                            <ListBlockEditor
                              block={block}
                              onChangeContent={(val) => handleUpdateBlockContent(block.id, val)}
                            />
                          )}

                          {/* TABLE BLOCK */}
                          {block.type === 'table' && (
                            <TableBlockEditor
                              block={block}
                              updateBlockAttrs={handleUpdateBlockAttrs}
                            />
                          )}

                          {/* IMAGE */}
                          {block.type === 'image' && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                              {block.attrs?.url ? (
                                <div className="space-y-2">
                                  <div className="relative group rounded-lg overflow-hidden border border-stone-200">
                                    <img
                                      src={block.attrs.url}
                                      alt={block.attrs.alt || ''}
                                      className="w-full h-auto max-w-full block"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateBlockAttrs(block.id, { url: '' })}
                                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition cursor-pointer"
                                      title="Remove image"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={block.attrs.caption || ''}
                                    onChange={(e) => handleUpdateBlockAttrs(block.id, { caption: e.target.value })}
                                    placeholder="Add caption..."
                                    className="w-full text-xs text-center text-stone-500 italic border-b border-stone-200 pb-1 focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div className="text-center py-6 border-2 border-dashed border-stone-300 rounded-lg space-y-2">
                                  <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-1" />
                                  <p className="text-xs font-semibold text-stone-600">Add Image to Post</p>
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto px-4">
                                    <input
                                      type="text"
                                      placeholder="Paste Image URL..."
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement;
                                          if (input.value) {
                                            handleUpdateBlockAttrs(block.id, { url: input.value });
                                          }
                                        }
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value) {
                                          handleUpdateBlockAttrs(block.id, { url: e.target.value });
                                        }
                                      }}
                                      className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg w-full focus:outline-pink-600"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* GALLERY */}
                          {block.type === 'gallery' && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                              <span className="text-xs font-bold text-stone-900 uppercase">Image Gallery</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {(block.attrs?.images || []).map((img: any, i: number) => (
                                  <div key={i} className="relative group">
                                    <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg border border-stone-200" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImgs = (block.attrs?.images || []).filter((_: any, idx: number) => idx !== i);
                                        handleUpdateBlockAttrs(block.id, { images: newImgs });
                                      }}
                                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Paste image URL and press Enter..."
                                  id={`gallery-input-${block.id}`}
                                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value) {
                                        const imgs = [...(block.attrs?.images || []), { url: input.value }];
                                        handleUpdateBlockAttrs(block.id, { images: imgs });
                                        input.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* VIDEO / YOUTUBE */}
                          {(block.type === 'video' || block.type === 'youtube') && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                {block.type === 'youtube' ? <Youtube className="w-4 h-4 text-red-600" /> : <Video className="w-4 h-4 text-stone-700" />}
                                <span className="text-xs font-bold text-stone-900 uppercase">
                                  {block.type === 'youtube' ? 'YouTube Embed' : 'Direct Video Stream'}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={block.type === 'youtube' ? block.attrs?.youtubeId || '' : block.attrs?.url || ''}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  if (block.type === 'youtube' && val.includes('youtube.com/watch?v=')) {
                                    val = val.split('v=')[1]?.split('&')[0] || val;
                                  } else if (block.type === 'youtube' && val.includes('youtu.be/')) {
                                    val = val.split('youtu.be/')[1]?.split('?')[0] || val;
                                  }
                                  handleUpdateBlockAttrs(block.id, block.type === 'youtube' ? { youtubeId: val } : { url: val });
                                }}
                                placeholder={block.type === 'youtube' ? 'Paste YouTube video URL or ID...' : 'Paste MP4 / WebM video URL...'}
                                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-pink-600"
                              />
                            </div>
                          )}

                          {/* AUDIO */}
                          {block.type === 'audio' && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 text-pink-600" />
                                <span className="text-xs font-bold text-stone-900 uppercase">Audio Track Player</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={block.attrs?.audioTitle || ''}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { audioTitle: e.target.value })}
                                  placeholder="Audio Title (e.g. Episode 1)"
                                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                                />
                                <input
                                  type="text"
                                  value={block.attrs?.audioArtist || ''}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { audioArtist: e.target.value })}
                                  placeholder="Artist / Host"
                                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                                />
                              </div>
                              <input
                                type="text"
                                value={block.attrs?.audioUrl || block.attrs?.url || ''}
                                onChange={(e) => handleUpdateBlockAttrs(block.id, { audioUrl: e.target.value, url: e.target.value })}
                                placeholder="Paste MP3 / Audio Stream URL..."
                                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-pink-600"
                              />
                              {(block.attrs?.audioUrl || block.attrs?.url) && (
                                <audio controls src={block.attrs?.audioUrl || block.attrs?.url} className="w-full h-10 mt-2" />
                              )}
                            </div>
                          )}

                          {/* BUTTON */}
                          {(block.type === 'button' || block.type === 'buttons') && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                              <span className="text-xs font-bold text-stone-900 uppercase">Call to Action Button</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={block.attrs?.buttonText || block.content || ''}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { buttonText: e.target.value })}
                                  placeholder="Button Label..."
                                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                                />
                                <input
                                  type="text"
                                  value={block.attrs?.buttonUrl || '#'}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { buttonUrl: e.target.value })}
                                  placeholder="Target URL..."
                                  className="text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                                />
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={block.attrs?.buttonStyle || 'primary'}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { buttonStyle: e.target.value })}
                                  className="text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                                >
                                  <option value="primary">Primary (Pink)</option>
                                  <option value="secondary">Secondary (Gray)</option>
                                  <option value="outline">Outline</option>
                                </select>
                                <select
                                  value={block.attrs?.buttonAlign || 'left'}
                                  onChange={(e) => handleUpdateBlockAttrs(block.id, { buttonAlign: e.target.value })}
                                  className="text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                                >
                                  <option value="left">Align Left</option>
                                  <option value="center">Align Center</option>
                                  <option value="right">Align Right</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* SEPARATOR */}
                          {(block.type === 'separator' || block.type === 'divider') && (
                            <div className="py-4">
                              <hr className="border-t-2 border-stone-200" />
                            </div>
                          )}

                          {/* SPACER */}
                          {block.type === 'spacer' && (
                            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-lg p-3 text-center space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-stone-500">Spacer Height: {block.attrs?.height || 40}px</span>
                                <div className="flex gap-1">
                                  {[20, 40, 60, 80].map((h) => (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => handleUpdateBlockAttrs(block.id, { height: h })}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                                        (block.attrs?.height || 40) === h ? 'bg-pink-600 text-white' : 'bg-stone-200 text-stone-700'
                                      }`}
                                    >
                                      {h}px
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ height: `${block.attrs?.height || 40}px` }} className="bg-stone-200/50 rounded w-full" />
                            </div>
                          )}

                          {/* COLUMNS */}
                          {block.type === 'columns' && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                              <span className="text-xs font-bold text-stone-900 uppercase">Two Columns</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white border border-stone-200 rounded-lg p-3">
                                  <RichEditableBlock
                                    placeholder="Column 1 content..."
                                    html={block.attrs?.columns?.[0]?.blocks?.[0]?.content || ''}
                                    onChange={(val) => {
                                      const cols = block.attrs?.columns || [{ blocks: [{ content: '' }] }, { blocks: [{ content: '' }] }];
                                      cols[0].blocks[0].content = val;
                                      handleUpdateBlockAttrs(block.id, { columns: cols });
                                    }}
                                    className="w-full text-sm font-serif min-h-[4rem]"
                                  />
                                </div>
                                <div className="bg-white border border-stone-200 rounded-lg p-3">
                                  <RichEditableBlock
                                    placeholder="Column 2 content..."
                                    html={block.attrs?.columns?.[1]?.blocks?.[0]?.content || ''}
                                    onChange={(val) => {
                                      const cols = block.attrs?.columns || [{ blocks: [{ content: '' }] }, { blocks: [{ content: '' }] }];
                                      cols[1].blocks[0].content = val;
                                      handleUpdateBlockAttrs(block.id, { columns: cols });
                                    }}
                                    className="w-full text-sm font-serif min-h-[4rem]"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* EMBED */}
                          {block.type === 'embed' && (
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                              <span className="text-xs font-bold text-stone-900 uppercase">Embed Content / iFrame</span>
                              <input
                                type="text"
                                value={block.attrs?.embedUrl || ''}
                                onChange={(e) => handleUpdateBlockAttrs(block.id, { embedUrl: e.target.value })}
                                placeholder="Paste embed URL or Spotify / Vimeo link..."
                                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-pink-600"
                              />
                            </div>
                          )}

                          {/* CUSTOM HTML */}
                          {block.type === 'html' && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold font-mono text-stone-500 uppercase">&lt;/&gt; Custom HTML Snippet</span>
                              <textarea
                                value={block.content}
                                onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                                placeholder="<div class='my-widget'>HTML Code</div>"
                                rows={3}
                                className="w-full font-mono text-xs p-3 bg-stone-900 text-stone-100 rounded-lg focus:outline-pink-600 resize-y"
                              />
                            </div>
                          )}

                          {/* CODE BLOCK */}
                          {block.type === 'code' && (
                            <div className="space-y-2 my-2 bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-stone-100 shadow-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs">
                                <div className="flex items-center gap-2">
                                  <Code className="w-4 h-4 text-pink-400" />
                                  <span className="font-mono font-bold text-stone-200">Code Snippet</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={block.attrs?.language || 'javascript'}
                                    onChange={(e) => handleUpdateBlockAttrs(block.id, { language: e.target.value })}
                                    className="text-xs bg-stone-800 text-stone-200 border border-stone-700 rounded-md px-2 py-1 outline-none cursor-pointer hover:bg-stone-700 transition"
                                  >
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="sql">SQL</option>
                                    <option value="json">JSON</option>
                                    <option value="bash">Bash / Shell</option>
                                    <option value="php">PHP</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="plaintext">Plain Text</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(block.content || '');
                                      setSuccessMsg('Code snippet copied to clipboard');
                                      setTimeout(() => setSuccessMsg(''), 2000);
                                    }}
                                    className="p-1 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded transition cursor-pointer"
                                    title="Copy code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={block.content}
                                onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                                placeholder="// Type or paste code snippet here..."
                                rows={Math.max(4, (block.content || '').split('\n').length)}
                                className="w-full font-mono text-xs p-2 bg-stone-950/70 border border-stone-800 text-emerald-300 placeholder:text-stone-600 rounded-lg focus:outline-pink-500 resize-y leading-relaxed"
                              />
                            </div>
                          )}

                          {/* TABLE OF CONTENTS */}
                          {block.type === 'table-of-contents' && (
                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                              <span className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-pink-600" />
                                Table of Contents (Auto-Generated from H2/H3 Headings)
                              </span>
                            </div>
                          )}

                          {/* ALSO READ */}
                          {block.type === 'alsoRead' && (
                            <AlsoReadBlockEditor
                              block={block}
                              updateBlockAttrs={handleUpdateBlockAttrs}
                            />
                          )}

                          {/* FAQ */}
                          {block.type === 'faq' && (
                            <FaqBlockEditor
                              block={block}
                              updateBlockAttrs={handleUpdateBlockAttrs}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* End of Post Inserter: directly inserts a Paragraph block */}
                  <BetweenBlockInserter
                    targetIndex={blocks.length}
                    onInsertParagraph={handleInsertParagraph}
                  />
                </div>

                {/* Quick Add New Block Button at Bottom: inserts Paragraph block and auto-focuses */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleInsertParagraph(blocks.length)}
                    className="px-4 py-2 border-2 border-dashed border-stone-300 hover:border-pink-500 text-stone-500 hover:text-pink-600 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Block</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ==================================================== */}
        {/* RIGHT SIDEBAR: SETTINGS & SEO (STAYS FIXED / STICKY) */}
        {/* ==================================================== */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="bg-white border-l border-stone-200 h-full overflow-y-auto z-20 flex flex-col shrink-0"
            >
              {/* Sidebar Header with Tabs */}
              <div className="p-3.5 border-b border-stone-200 shrink-0 bg-stone-50/50">
                <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab('post')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeSettingsTab === 'post'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab('settings')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeSettingsTab === 'settings'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSettingsTab('seo')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeSettingsTab === 'seo'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    SEO
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {/* ---------------- POST TAB ---------------- */}
                {activeSettingsTab === 'post' && (
                  <>
                    {/* Status & Visibility */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Status & Visibility
                      </label>
                      <DropdownSelect<string>
                        value={status}
                        onChange={(val) => {
                          setStatus(val);
                          setSaveStatusText('Unsaved changes');
                          if (val === 'scheduled' && !publishedAtLocal) {
                            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                            setPublishedAtLocal(tomorrow.toISOString().slice(0, 16));
                          }
                        }}
                        options={[
                          {
                            value: 'draft',
                            label: 'Draft',
                            sublabel: 'Saved privately, not visible to public',
                            badge: 'DRAFT',
                            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                          },
                          {
                            value: 'published',
                            label: 'Published',
                            sublabel: 'Live and publicly visible to readers',
                            badge: 'LIVE',
                            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          },
                          {
                            value: 'scheduled',
                            label: 'Scheduled',
                            sublabel: 'Will be published at scheduled date & time',
                            badge: 'SCHEDULE',
                            badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                          },
                        ]}
                      />

                      {status === 'scheduled' && (
                        <div className="pt-2">
                          <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                            Schedule Date & Time:
                          </label>
                          <input
                            id="schedule-datetime-input"
                            type="datetime-local"
                            value={publishedAtLocal}
                            onChange={(e) => {
                              setPublishedAtLocal(e.target.value);
                              setSaveStatusText('Unsaved changes');
                            }}
                            className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-[#EC008C] outline-none transition"
                          />
                        </div>
                      )}
                    </div>

                    {/* Author Selector */}
                    {users.length > 0 && !isAuthor && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Author
                        </label>
                        <DropdownSelect<string>
                          value={authorId}
                          onChange={(val) => {
                            setAuthorId(val);
                            setSaveStatusText('Unsaved changes');
                          }}
                          options={users.map((u) => ({
                            value: u.id,
                            label: u.name,
                            sublabel: u.email || undefined,
                            badge: (u.role || 'author').toUpperCase(),
                            badgeColor:
                              u.role?.toLowerCase() === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role?.toLowerCase() === 'editor'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          }))}
                        />
                      </div>
                    )}

                    {/* Primary Category Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Primary Category
                      </label>
                      <DropdownSelect<string>
                        value={categoryId}
                        onChange={(val) => handleCategoryChange(val)}
                        options={parentCategories.map((c) => ({
                          value: c.id,
                          label: c.name,
                          sublabel: `Slug: ${c.slug}`,
                        }))}
                      />
                    </div>

                    {/* Subcategory Selector (Synchronized Logic) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Subcategory
                      </label>
                      <DropdownSelect<string>
                        value={subCategoryId}
                        onChange={(val) => handleSubCategoryChange(val)}
                        options={[
                          {
                            value: 'none',
                            label: 'None (Parent Category Only)',
                            sublabel: 'Assign post to top-level parent category only',
                          },
                          ...availableSubCategories.map((sub) => ({
                            value: sub.id,
                            label: sub.name,
                            sublabel: `Slug: ${sub.slug}`,
                          })),
                        ]}
                      />
                      <p className="text-[10px] text-stone-400">
                        Selecting a subcategory automatically synchronizes with the parent category.
                      </p>
                    </div>

                    {/* Featured Image (Upload + Paste URL + No Caption field) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Featured Image
                        </label>
                        <span className="text-[10px] text-pink-600 font-medium">1050 × 586 px</span>
                      </div>
                      {featuredImage ? (
                        <div className="space-y-2">
                          <div className="relative group rounded-xl overflow-hidden border border-stone-200">
                            <img src={featuredImage} alt="Featured" className="w-full h-36 object-cover" />
                            <button
                              type="button"
                              onClick={() => setFeaturedImage('')}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg transition cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={featuredImage}
                              onChange={(e) => setFeaturedImage(e.target.value)}
                              placeholder="Image URL..."
                              className="flex-1 text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center space-y-3">
                          <ImageIcon className="w-6 h-6 text-stone-400 mx-auto" />
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{isUploadingFeatured ? 'Uploading...' : 'Upload Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadFeaturedImage}
                              className="hidden"
                              disabled={isUploadingFeatured}
                            />
                          </label>
                          <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-stone-200" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                              <span className="bg-white px-2 text-stone-400">or paste URL</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleApplyImageUrl()}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-pink-600"
                            />
                            <button
                              type="button"
                              onClick={handleApplyImageUrl}
                              className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                            >
                              Set
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags Chip Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Article Tags
                        </label>
                        <span className="text-[10px] text-stone-400">
                          {tagChips.length} tag{tagChips.length !== 1 ? 's' : ''} added
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 bg-stone-50 p-2 border border-stone-200 rounded-lg min-h-[42px] focus-within:border-[#EC008C] transition-colors">
                        {tagChips.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pink-200 text-stone-800 text-[11px] font-medium rounded-md shadow-2xs"
                          >
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="text-stone-400 hover:text-red-500 cursor-pointer transition-colors"
                              title={`Remove ${t}`}
                            >
                              <X className="w-3 h-3" />
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
                              handleAddTag(tagInputValue);
                            }
                          }}
                          placeholder="Type tag & enter..."
                          className="flex-1 min-w-[120px] text-xs bg-transparent border-none outline-none px-1"
                        />
                      </div>

                      {/* Suggested / Available Database Tags */}
                      {availableSystemTags.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
                            Available Tags:
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {availableSystemTags
                              .filter((sysTag) => !tagChips.includes(sysTag.name))
                              .filter((sysTag) =>
                                tagInputValue.trim()
                                  ? sysTag.name.toLowerCase().includes(tagInputValue.toLowerCase().trim())
                                  : true
                              )
                              .slice(0, 10)
                              .map((sysTag) => (
                                <button
                                  key={sysTag.id}
                                  type="button"
                                  onClick={() => handleAddTag(sysTag.name)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 hover:bg-pink-50 hover:text-[#EC008C] hover:border-pink-200 border border-stone-200 text-[10px] font-medium rounded text-stone-600 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>{sysTag.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ---------------- SETTINGS TAB ------------ */}
                {activeSettingsTab === 'settings' && (
                  <>
                    {/* Permalink Slug with Subcategory Prefix Display */}
                    {(() => {
                      const selectedSubCat =
                        subCategoryId && subCategoryId !== 'none'
                          ? categories.find((c) => c.id === subCategoryId)
                          : null;
                      const subCategorySlug = selectedSubCat?.slug || '';
                      const displayedPrefix = subCategorySlug ? `${subCategorySlug}/` : '/article/';

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                              URL Slug
                            </label>
                            {selectedSubCat && (
                              <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 truncate max-w-[160px]">
                                {selectedSubCat.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20 transition">
                            <span className="text-stone-500 text-xs font-mono select-none shrink-0 font-medium">
                              {displayedPrefix}
                            </span>
                            <input
                              type="text"
                              value={slug}
                              onChange={(e) => {
                                let val = e.target.value;
                                if (subCategorySlug && val.startsWith(`${subCategorySlug}/`)) {
                                  val = val.slice(`${subCategorySlug}/`.length);
                                } else if (val.startsWith('/article/')) {
                                  val = val.slice('/article/'.length);
                                } else {
                                  val = val.replace(/^\/+/, '');
                                }
                                setSlug(val);
                                setSaveStatusText('Unsaved changes');
                              }}
                              placeholder="article-slug-here"
                              className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-stone-900 focus:ring-0 p-0 ml-1 min-w-0 font-medium"
                            />
                          </div>
                          {selectedSubCat ? (
                            <p className="text-[10px] text-stone-500 leading-tight">
                              Display Path:{' '}
                              <span className="font-mono text-stone-800 font-semibold">
                                {subCategorySlug}/{slug || 'article-slug'}
                              </span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-stone-400">
                              Select a subcategory in the Post tab to synchronize the URL slug prefix.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Article Highlights Flags */}
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Editorial Flags
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded border-stone-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span>Featured Hero Article</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTrending}
                          onChange={(e) => setIsTrending(e.target.checked)}
                          className="rounded border-stone-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span>Trending Story</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEditorPick}
                          onChange={(e) => setIsEditorPick(e.target.checked)}
                          className="rounded border-stone-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span>Editor's Pick</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowComments}
                          onChange={(e) => setAllowComments(e.target.checked)}
                          className="rounded border-stone-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span>Allow Reader Comments</span>
                      </label>
                    </div>

                    {/* Publication Date (Admin Manual Override) */}
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Published Date & Time
                        </label>
                        <span className="text-[10px] text-pink-600 font-medium">Asia/Kolkata (IST)</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={publishedAtLocal}
                        onChange={(e) => {
                          setPublishedAtLocal(e.target.value);
                          setSaveStatusText('Unsaved changes');
                        }}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-pink-600 font-mono"
                      />
                      <p className="text-[10px] text-stone-400">
                        Manually set or adjust the article's official Published Date.
                      </p>
                    </div>
                  </>
                )}

                {/* ---------------- SEO TAB ---------------- */}
                {activeSettingsTab === 'seo' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Google search title..."
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-pink-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Meta Description
                      </label>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="150-160 characters summary for search engine snippet..."
                        rows={3}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-pink-600 resize-y"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        placeholder="Primary search phrase..."
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-pink-600"
                      />
                    </div>

                    {/* Google SERP Preview */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 font-sans">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Google SERP Preview</span>
                      <p className="text-[11px] text-emerald-700 truncate font-mono">
                        {(() => {
                          const selectedSubCat =
                            subCategoryId && subCategoryId !== 'none'
                              ? categories.find((c) => c.id === subCategoryId)
                              : null;
                          const subSlug = selectedSubCat?.slug || 'uncategorized';
                          return `https://www.nayaandaaz.com/${subSlug}/${slug || 'article-url'}`;
                        })()}
                      </p>
                      <p className="text-xs font-bold text-blue-700 hover:underline line-clamp-1">
                        {seoTitle || title || 'Article Title'}
                      </p>
                      <p className="text-[11px] text-stone-600 line-clamp-2">
                        {metaDescription || subtitle || 'Article meta description snippet...'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LINK INSERTION & EDITING MODAL                       */}
      {/* ---------------------------------------------------- */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-pink-600" />
                <h3 className="text-sm font-bold text-stone-900">Insert / Edit Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-lg text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyLinkModal();
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={linkModalUrl}
                  onChange={(e) => setLinkModalUrl(e.target.value)}
                  placeholder="https://example.com or /posts/slug"
                  autoFocus
                  required
                  className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Link Text (Anchor)
                </label>
                <input
                  type="text"
                  value={linkModalText}
                  onChange={(e) => setLinkModalText(e.target.value)}
                  placeholder="Text to display..."
                  className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-pink-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  checked={linkModalNewTab}
                  onChange={(e) => setLinkModalNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-stone-300 cursor-pointer"
                />
                <label htmlFor="openInNewTab" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Open link in a new tab (<code className="text-pink-600">target=&quot;_blank&quot;</code>)
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium cursor-pointer"
                >
                  Remove Link
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LIVE PREVIEW MODAL                                   */}
      {/* ---------------------------------------------------- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Article Preview — Naya Andaaz
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-12 overflow-y-auto flex-1 font-serif">
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">{title || 'Untitled Article'}</h1>
              {subtitle && <p className="text-lg italic text-stone-600 mb-6">{subtitle}</p>}
              {featuredImage && (
                <img src={featuredImage} alt="" className="w-full h-72 object-cover rounded-xl mb-8" />
              )}
              <div
                className="prose max-w-none text-stone-800"
                dangerouslySetInnerHTML={{ __html: serializeBlocksToHtml(blocks) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
