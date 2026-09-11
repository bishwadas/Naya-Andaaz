'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Table as TableIcon,
  BookOpen,
  Search,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Block } from '@/lib/blocks';
import { Post } from '@/types';

// ----------------------------------------------------
// FAQ BLOCK EDITOR COMPONENT
// ----------------------------------------------------
export function FaqBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const items = block.items || block.attrs?.items || [];

  const handleItemChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedItems = [...items];
    if (!updatedItems[index]) return;
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  const handleAddItem = () => {
    const updatedItems = [...items, { question: '', answer: '' }];
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
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
    updateBlockAttrs(block.id, { items: updatedItems });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-pink-600" />
          <span className="text-xs font-bold text-stone-900 uppercase">
            FAQ Accordion Section ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add FAQ Item</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200 rounded-lg p-3 space-y-2 shadow-2xs relative group/faq"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase font-mono">
                Q{idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-100 cursor-pointer"
                  title="Move question up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-100 cursor-pointer"
                  title="Move question down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer transition"
                  title="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={item.question}
              onChange={(e) => handleItemChange(idx, 'question', e.target.value)}
              placeholder="Question (e.g. What is the cancellation policy?)..."
              className="w-full text-xs font-semibold text-stone-800 border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-pink-600"
            />

            <textarea
              value={item.answer}
              onChange={(e) => handleItemChange(idx, 'answer', e.target.value)}
              placeholder="Answer text providing comprehensive response to the question..."
              rows={2}
              className="w-full text-xs font-serif text-stone-700 border border-stone-200 rounded-md p-2.5 focus:outline-pink-600 resize-y"
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-6 text-center text-xs text-stone-400 italic bg-white border border-dashed border-stone-200 rounded-lg">
            No FAQ questions added yet. Click &quot;Add FAQ Item&quot; to begin.
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TABLE BLOCK EDITOR COMPONENT
// ----------------------------------------------------
export function TableBlockEditor({
  block,
  updateBlockAttrs,
}: {
  block: Block;
  updateBlockAttrs: (id: string, attrs: any) => void;
}) {
  const tableData = block.attrs?.tableData || {
    headers: ['Header 1', 'Header 2'],
    rows: [
      ['Cell 1', 'Cell 2'],
      ['Cell 3', 'Cell 4'],
    ],
    hasHeader: true,
  };

  const headers = tableData.headers || ['Col 1', 'Col 2'];
  const rows = tableData.rows || [['', '']];
  const hasHeader = tableData.hasHeader !== false;

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((r, ri) =>
      ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? value : c)) : r
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-pink-600" />
          <span className="text-xs font-bold text-stone-900 uppercase">
            Data Table ({rows.length} rows × {headers.length} cols)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleHeaderRow}
            className={`px-2 py-1 rounded text-xs font-medium border transition cursor-pointer ${
              hasHeader
                ? 'bg-pink-50 border-pink-200 text-pink-700'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            {hasHeader ? 'Header Row: ON' : 'Header Row: OFF'}
          </button>
          <button
            type="button"
            onClick={handleAddRow}
            className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded text-xs font-semibold text-stone-700 transition cursor-pointer"
          >
            + Add Row
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded text-xs font-semibold text-stone-700 transition cursor-pointer"
          >
            + Add Column
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-stone-200 rounded-lg bg-white shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          {hasHeader && (
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                <th className="p-2 w-8 text-center text-stone-400 font-mono text-[10px]">#</th>
                {headers.map((h, ci) => (
                  <th key={ci} className="p-2 border-r border-stone-200 last:border-r-0">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => handleHeaderChange(ci, e.target.value)}
                        placeholder={`Header ${ci + 1}`}
                        className="w-full font-bold text-stone-800 bg-transparent border-none outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                      {headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(ci)}
                          className="p-0.5 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-2 w-8" />
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-stone-50/70 transition">
                <td className="p-2 text-center text-stone-400 font-mono text-[10px] bg-stone-50/50">
                  {ri + 1}
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1 border-r border-stone-100 last:border-r-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                      placeholder="Cell value..."
                      className="w-full text-xs text-stone-800 bg-transparent border-none outline-none focus:bg-pink-50/40 focus:ring-1 focus:ring-pink-500 rounded px-1.5 py-1"
                    />
                  </td>
                ))}
                <td className="p-1 text-center w-8">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(ri)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
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
// ALSO READ BLOCK EDITOR COMPONENT
// ----------------------------------------------------
export function AlsoReadBlockEditor({
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

  const postId = block.postId || block.attrs?.postId || '';

  // Fetch posts on search or mount
  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts?status=published');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const list = Array.isArray(data) ? data : data.posts || [];
            setPosts(list);
            if (postId) {
              const matched = list.find((p: Post) => p.id === postId);
              if (matched) setSelectedPost(matched);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load posts for AlsoRead block', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPost = (p: Post) => {
    setSelectedPost(p);
    updateBlockAttrs(block.id, {
      postId: p.id,
      linkUrl: `/post/${p.slug}`,
      linkText: p.title,
    });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-600" />
          <span className="text-xs font-bold text-stone-900 uppercase">
            Also Read Recommendation Card
          </span>
        </div>
      </div>

      {selectedPost ? (
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {selectedPost.featuredImage && (
              <img
                src={selectedPost.featuredImage}
                alt=""
                className="w-14 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
              />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                Selected Story
              </span>
              <h4 className="text-xs font-bold text-stone-900 truncate font-serif">
                {selectedPost.title}
              </h4>
              <p className="text-[11px] text-stone-500 truncate font-mono">
                /post/{selectedPost.slug}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPost(null);
              updateBlockAttrs(block.id, { postId: '', linkUrl: '', linkText: '' });
            }}
            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search published articles to recommend..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-pink-600"
            />
          </div>

          {loading ? (
            <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-600" />
              <span>Loading articles...</span>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white shadow-2xs">
              {filteredPosts.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPost(p)}
                  className="w-full text-left p-2.5 hover:bg-pink-50/50 transition flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate font-serif">
                      {p.title}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Published on {new Date(p.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>
              ))}

              {filteredPosts.length === 0 && (
                <div className="p-4 text-center text-xs text-stone-400">
                  No matching published articles found.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// BETWEEN BLOCK INSERTER COMPONENT
// ----------------------------------------------------
export function BetweenBlockInserter({
  targetIndex,
  onInsertParagraph,
}: {
  targetIndex: number;
  onInsertParagraph: (index: number) => void;
}) {
  return (
    <div className="relative group/inserter h-4 my-1 flex items-center justify-center">
      <div className="opacity-0 group-hover/inserter:opacity-100 transition-opacity duration-150 flex items-center justify-center w-full">
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
