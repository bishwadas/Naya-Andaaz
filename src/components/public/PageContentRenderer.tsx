'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Music,
  Video,
  Copy,
  Check,
} from 'lucide-react';
import { Block, parseHtmlToBlocks, sanitizeHtml } from '@/lib/blocks';

export function PageContentRenderer({ content }: { content: string }) {
  const blocks = React.useMemo(() => {
    if (!content) return [];
    return parseHtmlToBlocks(content);
  }, [content]);

  // If no blocks parsed but raw HTML or plain text is present
  if (blocks.length === 0) {
    if (!content) {
      return <p className="text-stone-500 italic">No content available on this page.</p>;
    }
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-stone prose-lg max-w-none font-serif text-stone-800 leading-relaxed space-y-4"
      />
    );
  }

  return (
    <div className="space-y-6 font-serif text-stone-800 leading-relaxed">
      {blocks.map((block) => (
        <RenderSingleBlock key={block.id} block={block} allBlocks={blocks} />
      ))}
    </div>
  );
}

function RenderSingleBlock({ block, allBlocks }: { block: Block; allBlocks: Block[] }) {
  const [isCopied, setIsCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  switch (block.type) {
    case 'paragraph': {
      const align = block.attrs?.align || 'left';
      return (
        <p
          style={{ textAlign: align }}
          className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'heading-h2': {
      const align = block.attrs?.align || 'left';
      const headingId = `h2-${block.id}`;
      return (
        <h2
          id={headingId}
          style={{ textAlign: align }}
          className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-8 mb-4 scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'heading-h3': {
      const align = block.attrs?.align || 'left';
      const headingId = `h3-${block.id}`;
      return (
        <h3
          id={headingId}
          style={{ textAlign: align }}
          className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-6 mb-3 scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'heading-h4': {
      const align = block.attrs?.align || 'left';
      return (
        <h4
          style={{ textAlign: align }}
          className="text-lg sm:text-xl font-bold font-serif text-stone-850 mt-4 mb-2"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
        />
      );
    }

    case 'quote': {
      return (
        <figure className="my-6 border-l-4 border-pink-600 pl-6 italic text-stone-800 font-serif bg-stone-50/60 py-4 rounded-r-xl">
          <blockquote
            className="text-lg sm:text-xl leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
          />
          {block.attrs?.author && (
            <figcaption
              className="text-xs font-sans not-italic font-bold text-stone-500 mt-2 uppercase tracking-wider"
              dangerouslySetInnerHTML={{ __html: '— ' + sanitizeHtml(block.attrs.author) }}
            />
          )}
        </figure>
      );
    }

    case 'list-bullet': {
      const items = (block.content || '').split('\n').filter((l) => l.trim() !== '');
      return (
        <ul className="list-disc list-outside pl-6 space-y-2 text-base sm:text-lg font-serif">
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
          ))}
        </ul>
      );
    }

    case 'list-number': {
      const items = (block.content || '').split('\n').filter((l) => l.trim() !== '');
      return (
        <ol className="list-decimal list-outside pl-6 space-y-2 text-base sm:text-lg font-serif">
          {items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }} />
          ))}
        </ol>
      );
    }

    case 'table': {
      const tbl = block.attrs?.tableData;
      if (tbl && tbl.rows) {
        const hasHeader = tbl.hasHeader !== false && tbl.headers && tbl.headers.length > 0;
        return (
          <div className="my-6 overflow-x-auto border border-stone-200 rounded-xl shadow-2xs font-sans">
            <table className="w-full text-sm text-left border-collapse">
              {hasHeader && (
                <thead className="bg-stone-100/80 border-b border-stone-200">
                  <tr>
                    {tbl.headers.map((h: string, idx: number) => (
                      <th
                        key={idx}
                        className="p-3 font-bold text-stone-900 border-r border-stone-200 last:border-r-0"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(h) }}
                      />
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-stone-100 bg-white">
                {tbl.rows.map((r: string[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-stone-50/70 transition">
                    {r.map((c: string, cIdx: number) => (
                      <td
                        key={cIdx}
                        className="p-3 text-stone-800 border-r border-stone-100 last:border-r-0"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(c) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content || '') }}
          className="my-6 overflow-x-auto"
        />
      );
    }

    case 'faq': {
      const items = block.items || block.attrs?.items || [];
      if (!items.length) return null;
      return (
        <div className="my-8 bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 font-sans space-y-4 shadow-2xs">
          <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-600 inline-block" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {items.map((faq: { question: string; answer: string }, idx: number) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 font-bold text-sm sm:text-base text-stone-900 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition cursor-pointer"
                  >
                    <span>{faq.question || 'Untitled Question'}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-pink-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-sm font-serif text-stone-700 leading-relaxed border-t border-stone-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'table-of-contents': {
      const headings = allBlocks.filter(
        (b) => b.type === 'heading-h2' || b.type === 'heading-h3'
      );
      if (headings.length === 0) return null;
      return (
        <div className="my-8 bg-stone-50 border border-stone-200 rounded-2xl p-6 font-sans shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200 mb-4">
            <BookOpen className="w-4 h-4 text-pink-600" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Table of Contents
            </h4>
          </div>
          <nav className="space-y-2">
            {headings.map((h) => {
              const anchor = h.type === 'heading-h2' ? `h2-${h.id}` : `h3-${h.id}`;
              const isH3 = h.type === 'heading-h3';
              return (
                <a
                  key={h.id}
                  href={`#${anchor}`}
                  className={`block text-sm transition hover:text-pink-600 ${
                    isH3
                      ? 'pl-4 text-stone-600 hover:text-stone-900 text-xs'
                      : 'font-semibold text-stone-800'
                  }`}
                >
                  {h.content}
                </a>
              );
            })}
          </nav>
        </div>
      );
    }

    case 'alsoRead': {
      const linkUrl = block.attrs?.linkUrl || (block.postId ? `/post/${block.postId}` : '#');
      const linkText = block.attrs?.linkText || 'Recommended Reading';
      return (
        <div className="my-6 bg-pink-50/60 border-l-4 border-pink-600 rounded-r-xl p-4 font-sans flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block mb-1">
              Also Read
            </span>
            <Link
              href={linkUrl}
              className="text-sm sm:text-base font-bold font-serif text-stone-900 hover:text-pink-600 transition"
            >
              {linkText}
            </Link>
          </div>
          <ExternalLink className="w-4 h-4 text-pink-600 shrink-0" />
        </div>
      );
    }

    case 'image': {
      const url = block.attrs?.url;
      if (!url) return null;
      return (
        <figure className="my-8 font-sans w-full max-w-full block bg-transparent border-0 shadow-none p-0">
          <img
            src={url}
            alt={block.attrs?.alt || ''}
            className="w-full h-auto max-w-full rounded-none block"
          />
          {block.attrs?.caption && (
            <figcaption className="text-center text-xs text-stone-500 mt-2 italic font-serif">
              {block.attrs.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'gallery': {
      const images = block.attrs?.images || [];
      if (!images.length) return null;
      return (
        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
          {images.map((img: { url: string; caption?: string; alt?: string }, i: number) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-stone-200 shadow-2xs group"
            >
              <img
                src={img.url}
                alt={img.alt || ''}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {img.caption && (
                <p className="p-2 text-[11px] text-stone-600 bg-white border-t border-stone-100 truncate">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'video': {
      const url = block.attrs?.url;
      if (!url) return null;
      return (
        <div className="my-8 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs bg-black">
          <video controls src={url} className="w-full max-h-[500px]" />
        </div>
      );
    }

    case 'youtube': {
      let yid = block.attrs?.youtubeId || '';
      if (!yid && block.attrs?.url) {
        const match = block.attrs.url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
        if (match) yid = match[1];
      }
      if (!yid) return null;
      return (
        <div className="my-8 aspect-video rounded-2xl overflow-hidden border border-stone-200 shadow-2xs bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${yid}`}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    case 'audio': {
      const audioUrl = block.attrs?.audioUrl || block.attrs?.url;
      if (!audioUrl) return null;
      return (
        <div className="my-6 bg-stone-900 text-white rounded-2xl p-4 sm:p-5 font-sans space-y-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold truncate">
                {block.attrs?.audioTitle || 'Audio Track'}
              </h4>
              <p className="text-xs text-stone-400 truncate">
                {block.attrs?.audioArtist || 'Listen to recording'}
              </p>
            </div>
          </div>
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      );
    }

    case 'button': {
      const text = block.attrs?.buttonText || block.content || 'Learn More';
      const url = block.attrs?.buttonUrl || '#';
      const align = block.attrs?.buttonAlign || 'left';
      const style = block.attrs?.buttonStyle || 'primary';

      const styleClasses =
        style === 'secondary'
          ? 'bg-stone-800 hover:bg-stone-900 text-white'
          : style === 'outline'
          ? 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50'
          : 'bg-pink-600 hover:bg-pink-700 text-white shadow-xs';

      return (
        <div style={{ textAlign: align }} className="my-6 font-sans">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${styleClasses}`}
          >
            <span>{text}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      );
    }

    case 'columns': {
      const cols = block.attrs?.columns || [];
      return (
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cols.map((c: any, i: number) => (
            <div key={i} className="space-y-4">
              {(c.blocks || []).map((subBlock: Block, sIdx: number) => (
                <RenderSingleBlock key={subBlock.id || sIdx} block={subBlock} allBlocks={allBlocks} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    case 'separator':
    case 'divider': {
      return <hr className="my-10 border-t-2 border-stone-200" />;
    }

    case 'spacer': {
      const h = block.attrs?.height || 40;
      return <div style={{ height: `${h}px` }} aria-hidden="true" />;
    }

    case 'code': {
      const lang = block.attrs?.language || 'code';
      const handleCopy = () => {
        navigator.clipboard.writeText(block.content || '');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      };
      return (
        <div className="my-6 bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 font-sans shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-800 text-xs text-stone-400 font-mono">
            <span>{lang}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-white transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    }

    case 'embed': {
      const embedUrl = block.attrs?.embedUrl || block.attrs?.url;
      if (!embedUrl) return null;
      return (
        <div className="my-8 aspect-video rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
          <iframe
            src={embedUrl}
            title="Embedded content"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );
    }

    case 'html': {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: block.content }}
          className="my-6"
        />
      );
    }

    default:
      return (
        <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-serif">
          {block.content}
        </p>
      );
  }
}
