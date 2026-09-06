export type BlockType =
  | 'paragraph'
  | 'heading-h2'
  | 'heading-h3'
  | 'heading-h4'
  | 'image'
  | 'gallery'
  | 'quote'
  | 'list-bullet'
  | 'list-number'
  | 'table'
  | 'video'
  | 'youtube'
  | 'audio'
  | 'button'
  | 'buttons'
  | 'link'
  | 'divider'
  | 'separator'
  | 'spacer'
  | 'columns'
  | 'embed'
  | 'table-of-contents'
  | 'alsoRead'
  | 'faq'
  | 'code'
  | 'html';

export interface Block {
  id: string;
  type: BlockType;
  content: string; // Text content or HTML
  postId?: string; // For alsoRead block
  items?: { question: string; answer: string }[]; // For faq block
  attrs?: {
    postId?: string;
    items?: { question: string; answer: string }[];
    url?: string;
    caption?: string;
    alt?: string;
    images?: { url: string; caption?: string; alt?: string }[];
    linkUrl?: string;
    linkText?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    language?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonAlign?: 'left' | 'center' | 'right';
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    buttons?: { text: string; url: string; style?: 'primary' | 'secondary' | 'outline' }[];
    author?: string;
    columns?: { id: string; blocks: Block[] }[];
    youtubeId?: string;
    autoplay?: boolean;
    aspectRatio?: '16-9' | '4-3' | '1-1';
    // Audio block attributes
    audioUrl?: string;
    audioTitle?: string;
    audioArtist?: string;
    // Table block attributes
    tableData?: {
      headers?: string[];
      rows: string[][];
      hasHeader?: boolean;
    };
    // Spacer block attributes
    height?: number; // e.g. 40
    // Embed block attributes
    embedUrl?: string;
    embedType?: 'youtube' | 'twitter' | 'instagram' | 'spotify' | 'vimeo' | 'generic';
    embedHtml?: string;
  };
}

/**
 * Sanitize HTML safely without stripping legitimate editorial formatting.
 * Decodes entity-encoded tags (e.g. &lt;strong&gt;Why watch:&lt;/strong&gt;) so they render
 * as real formatting instead of literal text, while strictly stripping dangerous scripts.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let cleaned = html;

  // 1. Detect and decode entity-encoded editorial HTML tags if present
  if (/&lt;\/?(?:strong|em|p|b|i|u|s|br|h[1-6]|span|a|ul|ol|li|blockquote|table|thead|tbody|tr|td|th|figure|figcaption|img|mark|sub|sup|code|pre|hr|del|ins)\b/i.test(cleaned)) {
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // 2. Strip dangerous executable tags and blocks: <script>, <style>, <object>, <embed>, <applet>
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  cleaned = cleaned.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');

  // 3. Strip inline event handlers: e.g. onload, onerror, onclick, onmouseover, onfocus, etc.
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');

  // 4. Strip unsafe protocols in href, src, action (javascript:, vbscript:, data:text/html)
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*["']\s*(?:javascript|vbscript|data\s*:\s*text\/html):[^"']*["']/gi, '$1="#"');
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*(?:javascript|vbscript|data\s*:\s*text\/html):[^\s>]+/gi, '$1="#"');

  return cleaned;
}

/**
 * Compile a list of block elements into plain HTML text
 * to store in posts.content (backward compatibility + search index).
 * Uses structured block comments <!-- block:{...} --> so that block types
 * and attributes are 100% preserved when switching between Visual and HTML modes.
 */
export function serializeBlocksToHtml(blocks: Block[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      let innerHtml = '';
      switch (block.type) {
        case 'paragraph': {
          const alignStyle = block.attrs?.align && block.attrs.align !== 'left' ? ` style="text-align: ${block.attrs.align};"` : '';
          innerHtml = `<p${alignStyle}>${block.content || ''}</p>`;
          break;
        }
        case 'heading-h2': {
          const alignStyle = block.attrs?.align && block.attrs.align !== 'left' ? ` style="text-align: ${block.attrs.align};"` : '';
          innerHtml = `<h2${alignStyle}>${block.content || ''}</h2>`;
          break;
        }
        case 'heading-h3': {
          const alignStyle = block.attrs?.align && block.attrs.align !== 'left' ? ` style="text-align: ${block.attrs.align};"` : '';
          innerHtml = `<h3${alignStyle}>${block.content || ''}</h3>`;
          break;
        }
        case 'heading-h4': {
          const alignStyle = block.attrs?.align && block.attrs.align !== 'left' ? ` style="text-align: ${block.attrs.align};"` : '';
          innerHtml = `<h4${alignStyle}>${block.content || ''}</h4>`;
          break;
        }
        case 'image': {
          const src = block.attrs?.url || '';
          const alt = block.attrs?.alt || '';
          const cap = block.attrs?.caption || '';
          innerHtml = `<figure class="wp-block-image"><img src="${src}" alt="${alt}" />${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
          break;
        }
        case 'gallery': {
          const imgs = block.attrs?.images || [];
          const imgTags = imgs.map((img) => `<img src="${img.url}" alt="${img.caption || img.alt || ''}" />`).join('');
          innerHtml = `<div class="naya-gallery sereia-gallery">${imgTags}</div>`;
          break;
        }
        case 'quote':
          innerHtml = `<blockquote><p>${block.content || ''}</p>${block.attrs?.author ? `<cite>${block.attrs.author}</cite>` : ''}</blockquote>`;
          break;
        case 'list-bullet': {
          const items = (block.content || '').split('\n').filter((l) => l.trim() !== '');
          const liTags = items.map((item) => `<li>${item}</li>`).join('');
          innerHtml = `<ul>${liTags}</ul>`;
          break;
        }
        case 'list-number': {
          const items = (block.content || '').split('\n').filter((l) => l.trim() !== '');
          const liTags = items.map((item) => `<li>${item}</li>`).join('');
          innerHtml = `<ol>${liTags}</ol>`;
          break;
        }
        case 'table': {
          const tbl = block.attrs?.tableData;
          if (tbl && tbl.rows) {
            const headHtml = tbl.headers && tbl.headers.length > 0 && tbl.hasHeader !== false
              ? `<thead><tr>${tbl.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`
              : '';
            const bodyHtml = `<tbody>${tbl.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
            innerHtml = `<table class="naya-table sereia-table">${headHtml}${bodyHtml}</table>`;
          } else {
            innerHtml = block.content.startsWith('<table') ? block.content : `<table class="naya-table sereia-table"><tbody><tr><td>${block.content || ''}</td></tr></tbody></table>`;
          }
          break;
        }
        case 'divider':
        case 'separator':
          innerHtml = '<hr class="naya-separator wp-block-separator" />';
          break;
        case 'spacer': {
          const h = block.attrs?.height || 32;
          innerHtml = `<div class="naya-spacer wp-block-spacer" style="height: ${h}px;" aria-hidden="true"></div>`;
          break;
        }
        case 'video':
          innerHtml = `<video controls src="${block.attrs?.url || ''}"></video>`;
          break;
        case 'youtube': {
          const yid = block.attrs?.youtubeId || '';
          innerHtml = `<iframe src="https://www.youtube.com/embed/${yid}" frameborder="0" allowfullscreen></iframe>`;
          break;
        }
        case 'audio': {
          const aUrl = block.attrs?.audioUrl || block.attrs?.url || '';
          const aTitle = block.attrs?.audioTitle || '';
          const aArtist = block.attrs?.audioArtist || '';
          innerHtml = `<div class="naya-audio sereia-audio" data-title="${aTitle}" data-artist="${aArtist}"><audio controls src="${aUrl}"><a href="${aUrl}">Listen to audio</a></audio></div>`;
          break;
        }
        case 'link':
          innerHtml = `<p><a href="${block.attrs?.linkUrl || '#'}">${block.attrs?.linkText || block.content || 'Link'}</a></p>`;
          break;
        case 'button': {
          const text = block.attrs?.buttonText || block.content || 'Button';
          const url = block.attrs?.buttonUrl || '#';
          const align = block.attrs?.buttonAlign || 'left';
          const style = block.attrs?.buttonStyle || 'primary';
          innerHtml = `<div style="text-align: ${align}"><a href="${url}" class="naya-btn sereia-btn ${style}">${text}</a></div>`;
          break;
        }
        case 'buttons': {
          const btns = block.attrs?.buttons || [];
          const align = block.attrs?.buttonAlign || 'left';
          const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
          const btnTags = btns.map((b) => `<a href="${b.url || '#'}" class="naya-btn sereia-btn ${b.style || 'primary'}">${b.text || 'Button'}</a>`).join('');
          innerHtml = `<div class="naya-buttons sereia-buttons" style="display: flex; gap: 12px; justify-content: ${justify}; flex-wrap: wrap;">${btnTags}</div>`;
          break;
        }
        case 'columns': {
          const cols = block.attrs?.columns || [];
          const colTags = cols
            .map((c) => `<div class="naya-column sereia-column">${serializeBlocksToHtml(c.blocks || [])}</div>`)
            .join('');
          innerHtml = `<div class="naya-columns sereia-columns grid md:grid-cols-2 gap-6">${colTags}</div>`;
          break;
        }
        case 'embed': {
          const eUrl = block.attrs?.embedUrl || block.attrs?.url || '';
          const eHtml = block.attrs?.embedHtml || '';
          if (eHtml) {
            innerHtml = `<div class="naya-embed sereia-embed">${eHtml}</div>`;
          } else if (eUrl.includes('youtube.com') || eUrl.includes('youtu.be')) {
            const vidMatch = eUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            const yid = vidMatch ? vidMatch[1] : '';
            innerHtml = `<iframe src="https://www.youtube.com/embed/${yid}" frameborder="0" allowfullscreen></iframe>`;
          } else {
            innerHtml = `<div class="naya-embed sereia-embed"><iframe src="${eUrl}" frameborder="0" loading="lazy"></iframe></div>`;
          }
          break;
        }
        case 'table-of-contents':
          innerHtml = '<div class="naya-toc sereia-toc">[Table of Contents]</div>';
          break;
        case 'alsoRead': {
          const pid = block.postId || block.attrs?.postId || '';
          innerHtml = `<div class="naya-also-read sereia-also-read" data-post-id="${pid}">[Also Read: ${pid}]</div>`;
          break;
        }
        case 'faq': {
          const items = block.items || block.attrs?.items || [];
          const encoded = encodeURIComponent(JSON.stringify(items));
          innerHtml = `<div class="naya-faq sereia-faq" data-items="${encoded}">[FAQ Items: ${items.length}]</div>`;
          break;
        }
        case 'code': {
          const lang = block.attrs?.language || 'plaintext';
          innerHtml = `<pre><code class="language-${lang}">${block.content || ''}</code></pre>`;
          break;
        }
        case 'html':
          innerHtml = sanitizeHtml(block.content || '');
          break;
        default:
          innerHtml = `<p>${block.content || ''}</p>`;
      }

      // We attach a hidden JSON block comment so we can reconstruct this perfectly when parsing.
      const meta = JSON.stringify({
        id: block.id,
        type: block.type,
        attrs: block.attrs,
        postId: block.postId,
        items: block.items,
      });

      return `<!-- block:${meta} -->\n${innerHtml}\n<!-- /block -->`;
    })
    .join('\n\n');
}

/**
 * Parses plain old text/HTML posts into block structures.
 * Respects our `<!-- block:{...} -->` metadata to perfectly preserve block types and attributes.
 * Falls back to intelligent HTML element parsing for legacy content.
 */
export function parseHtmlToBlocks(html: string): Block[] {
  if (!html || html.trim() === '') return [];

  // If it starts with JSON brackets, it might be stringified blocks
  if (html.trim().startsWith('[') && html.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(html);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].type) {
        return parsed;
      }
    } catch (_) {
      // Not JSON, continue
    }
  }

  const blocks: Block[] = [];
  const blockRegex = /<!--\s*block:({.*?})\s*-->([\s\S]*?)<!--\s*\/block\s*-->/g;

  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(html)) !== null) {
    // 1. Process any legacy HTML content that appeared before this block
    const precedingContent = html.substring(lastIndex, match.index).trim();
    if (precedingContent) {
      blocks.push(...parseLegacyHtmlToBlocks(precedingContent));
    }

    // 2. Process the matched block
    try {
      const meta = JSON.parse(match[1]);
      const innerHtml = match[2].trim();
      let content = innerHtml;
      const attrs = meta.attrs ? { ...meta.attrs } : {};
      let postId = meta.postId || attrs.postId;
      let items = meta.items || attrs.items;

      // Synchronize changes made while in HTML mode:
      if (meta.type === 'paragraph') {
        content = innerHtml.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '').trim();
      } else if (meta.type === 'heading-h2') {
        content = innerHtml.replace(/^<h2[^>]*>/i, '').replace(/<\/h2>$/i, '').trim();
      } else if (meta.type === 'heading-h3') {
        content = innerHtml.replace(/^<h3[^>]*>/i, '').replace(/<\/h3>$/i, '').trim();
      } else if (meta.type === 'heading-h4') {
        content = innerHtml.replace(/^<h4[^>]*>/i, '').replace(/<\/h4>$/i, '').trim();
      } else if (meta.type === 'quote') {
        const pMatch = innerHtml.match(/<p>([\s\S]*?)<\/p>/i);
        const citeMatch = innerHtml.match(/<cite>([\s\S]*?)<\/cite>/i);
        if (pMatch) {
          content = pMatch[1].trim();
        } else {
          content = innerHtml.replace(/^<blockquote[^>]*>/i, '').replace(/<\/blockquote>$/i, '').replace(/<cite>[\s\S]*?<\/cite>/i, '').trim();
        }
        if (citeMatch) {
          attrs.author = citeMatch[1].trim();
        }
      } else if (meta.type === 'list-bullet' || meta.type === 'list-number') {
        const liMatches = innerHtml.match(/<li>([\s\S]*?)<\/li>/gi);
        if (liMatches) {
          content = liMatches.map((li) => li.replace(/^<li>/i, '').replace(/<\/li>$/i, '').trim()).join('\n');
        } else {
          content = innerHtml.replace(/^<[uo]l[^>]*>/i, '').replace(/<\/[uo]l>$/i, '').trim();
        }
      } else if (meta.type === 'table') {
        content = innerHtml;
      } else if (meta.type === 'image') {
        content = '';
        const srcMatch = innerHtml.match(/src=["'](.*?)["']/i);
        if (srcMatch) attrs.url = srcMatch[1];
        const altMatch = innerHtml.match(/alt=["'](.*?)["']/i);
        if (altMatch) attrs.alt = altMatch[1];
        const capMatch = innerHtml.match(/<figcaption>([\s\S]*?)<\/figcaption>/i);
        if (capMatch) attrs.caption = capMatch[1].replace(/<[^>]+>/g, '').trim();
      } else if (meta.type === 'video') {
        content = '';
        const srcMatch = innerHtml.match(/src=["'](.*?)["']/i);
        if (srcMatch) attrs.url = srcMatch[1];
      } else if (meta.type === 'youtube') {
        content = '';
        const srcMatch = innerHtml.match(/src=["'](.*?)["']/i);
        if (srcMatch && srcMatch[1].includes('youtube.com/embed/')) {
          attrs.youtubeId = srcMatch[1].split('youtube.com/embed/')[1].split('?')[0].split('"')[0];
        }
      } else if (meta.type === 'audio') {
        content = '';
        const srcMatch = innerHtml.match(/src=["'](.*?)["']/i);
        if (srcMatch) attrs.audioUrl = srcMatch[1];
      } else if (meta.type === 'link') {
        const aMatch = innerHtml.match(/<a\s+href=["'](.*?)["'][^>]*>([\s\S]*?)<\/a>/i);
        if (aMatch) {
          attrs.linkUrl = aMatch[1];
          attrs.linkText = aMatch[2].trim();
          content = aMatch[2].trim();
        }
      } else if (meta.type === 'button') {
        const aMatch = innerHtml.match(/<a\s+href=["'](.*?)["'][^>]*>([\s\S]*?)<\/a>/i);
        if (aMatch) {
          attrs.buttonUrl = aMatch[1];
          attrs.buttonText = aMatch[2].trim();
          content = aMatch[2].trim();
        }
      } else if (meta.type === 'buttons') {
        content = '';
      } else if (meta.type === 'spacer') {
        content = '';
      } else if (meta.type === 'embed') {
        content = '';
      } else if (meta.type === 'table-of-contents') {
        content = '';
      } else if (meta.type === 'alsoRead') {
        content = '';
        const postMatch = innerHtml.match(/data-post-id=["'](.*?)["']/i);
        if (postMatch) {
          postId = postMatch[1];
          attrs.postId = postMatch[1];
        }
      } else if (meta.type === 'faq') {
        content = '';
        const itemsMatch = innerHtml.match(/data-items=["'](.*?)["']/i);
        if (itemsMatch) {
          try {
            const parsedItems = JSON.parse(decodeURIComponent(itemsMatch[1]));
            if (Array.isArray(parsedItems)) {
              items = parsedItems;
              attrs.items = parsedItems;
            }
          } catch (_) {}
        }
      } else if (meta.type === 'divider' || meta.type === 'separator') {
        content = '';
      } else if (meta.type === 'code') {
        const codeMatch = innerHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
        const classMatch = innerHtml.match(/class=["']language-([\w-]+)["']/i);
        if (classMatch && !attrs.language) {
          attrs.language = classMatch[1];
        }
        content = codeMatch ? codeMatch[1].trim() : innerHtml.replace(/^<pre[^>]*>/i, '').replace(/<\/pre>$/i, '').trim();
      } else if (meta.type === 'html') {
        content = innerHtml;
      }

      blocks.push({
        id: meta.id || `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: meta.type,
        content: content,
        attrs: attrs,
        postId: postId,
        items: items,
      });
    } catch (e) {
      // Fallback if parsing metadata fails
      blocks.push(...parseLegacyHtmlToBlocks(match[0]));
    }

    lastIndex = blockRegex.lastIndex;
  }

  // 3. Process any remaining legacy HTML content after the last block
  const remainingContent = html.substring(lastIndex).trim();
  if (remainingContent) {
    blocks.push(...parseLegacyHtmlToBlocks(remainingContent));
  }

  return blocks;
}

/**
 * Fallback parser for legacy HTML that doesn't have block metadata comments.
 * Infers standard block types from HTML tags.
 */
function parseLegacyHtmlToBlocks(html: string): Block[] {
  if (!html || html.trim() === '') return [];

  const blocks: Block[] = [];
  const tagRegex = /<(p|h1|h2|h3|h4|h5|h6|pre|figure|table|audio|div|ul|ol|blockquote|hr|video|iframe)([^>]*)>([\s\S]*?)<\/\1>|<(img|hr)([^>]*)\/?>/gi;

  let lastIndex = 0;
  let match;
  let hasBlockTags = false;

  while ((match = tagRegex.exec(html)) !== null) {
    hasBlockTags = true;
    const preText = html.substring(lastIndex, match.index).trim();
    if (preText) {
      blocks.push({
        id: `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'paragraph',
        content: preText,
      });
    }

    const tag = (match[1] || match[4] || '').toLowerCase();
    const attrsStr = match[2] || match[5] || '';
    const innerHtml = match[3] || '';
    const id = `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (tag === 'p') {
      // Check if p contains a solitary link or button
      const linkMatch = innerHtml.match(/^<a\s+href=["'](.*?)["'][^>]*>([\s\S]*?)<\/a>$/i);
      if (linkMatch) {
        blocks.push({
          id,
          type: 'link',
          content: linkMatch[2].trim(),
          attrs: { linkUrl: linkMatch[1], linkText: linkMatch[2].trim() },
        });
      } else {
        blocks.push({ id, type: 'paragraph', content: innerHtml });
      }
    } else if (tag === 'pre') {
      const codeMatch = innerHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
      const classMatch = (attrsStr + innerHtml).match(/class=["']language-([\w-]+)["']/i);
      const lang = classMatch ? classMatch[1] : 'plaintext';
      const content = codeMatch ? codeMatch[1].trim() : innerHtml.replace(/<[^>]+>/g, '').trim();
      blocks.push({ id, type: 'code', content, attrs: { language: lang } });
    } else if (tag === 'h1' || tag === 'h2') {
      blocks.push({ id, type: 'heading-h2', content: innerHtml });
    } else if (tag === 'h3') {
      blocks.push({ id, type: 'heading-h3', content: innerHtml });
    } else if (tag === 'h4' || tag === 'h5' || tag === 'h6') {
      blocks.push({ id, type: 'heading-h4', content: innerHtml });
    } else if (tag === 'table') {
      // Extract rows and headers if possible
      const headers: string[] = [];
      const thMatches = [...innerHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)];
      thMatches.forEach((m) => headers.push(m[1].replace(/<[^>]+>/g, '').trim()));
      const rows: string[][] = [];
      const trMatches = [...innerHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      trMatches.forEach((trm) => {
        const tdMatches = [...trm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        if (tdMatches.length > 0) {
          rows.push(tdMatches.map((td) => td[1].replace(/<[^>]+>/g, '').trim()));
        }
      });
      blocks.push({
        id,
        type: 'table',
        content: innerHtml,
        attrs: {
          tableData: {
            headers: headers.length > 0 ? headers : undefined,
            rows: rows.length > 0 ? rows : [['', ''], ['', '']],
            hasHeader: headers.length > 0,
          },
        },
      });
    } else if (tag === 'audio') {
      const srcMatch = attrsStr.match(/src=["'](.*?)["']/i) || innerHtml.match(/src=["'](.*?)["']/i);
      const audioUrl = srcMatch ? srcMatch[1] : '';
      blocks.push({
        id,
        type: 'audio',
        content: '',
        attrs: { audioUrl, audioTitle: 'Audio Track', audioArtist: '' },
      });
    } else if (tag === 'figure' || tag === 'img') {
      let src = '';
      let alt = '';
      let caption = '';

      const srcMatch = (match[0]).match(/src=["'](.*?)["']/i);
      if (srcMatch) src = srcMatch[1];

      const altMatch = (match[0]).match(/alt=["'](.*?)["']/i);
      if (altMatch) alt = altMatch[1];

      if (tag === 'figure') {
        const capMatch = innerHtml.match(/<figcaption>([\s\S]*?)<\/figcaption>/i);
        if (capMatch) caption = capMatch[1].replace(/<[^>]+>/g, '').trim();
      }

      blocks.push({ id, type: 'image', content: '', attrs: { url: src, alt, caption } });
    } else if (tag === 'div') {
      if (attrsStr.includes('naya-spacer') || attrsStr.includes('wp-block-spacer')) {
        const heightMatch = attrsStr.match(/height:\s*(\d+)px/i);
        const height = heightMatch ? parseInt(heightMatch[1], 10) : 32;
        blocks.push({ id, type: 'spacer', content: '', attrs: { height } });
      } else if (attrsStr.includes('naya-toc') || attrsStr.includes('sereia-toc') || innerHtml.includes('[Table of Contents]')) {
        blocks.push({ id, type: 'table-of-contents', content: '' });
      } else if (attrsStr.includes('naya-also-read') || attrsStr.includes('sereia-also-read')) {
        const postMatch = attrsStr.match(/data-post-id=["'](.*?)["']/i);
        const postId = postMatch ? postMatch[1] : '';
        blocks.push({ id, type: 'alsoRead', content: '', postId, attrs: { postId } });
      } else if (attrsStr.includes('naya-faq') || attrsStr.includes('sereia-faq')) {
        const itemsMatch = attrsStr.match(/data-items=["'](.*?)["']/i);
        let items: { question: string; answer: string }[] = [];
        if (itemsMatch) {
          try {
            items = JSON.parse(decodeURIComponent(itemsMatch[1]));
          } catch (_) {}
        }
        blocks.push({ id, type: 'faq', content: '', items, attrs: { items } });
      } else if (attrsStr.includes('naya-gallery') || attrsStr.includes('sereia-gallery')) {
        const imgMatches = [...innerHtml.matchAll(/<img[^>]+src=["'](.*?)["'][^>]*>/gi)];
        const images = imgMatches.map((m) => {
          const capMatch = m[0].match(/alt=["'](.*?)["']/i);
          return { url: m[1], caption: capMatch ? capMatch[1] : '' };
        });
        blocks.push({ id, type: 'gallery', content: '', attrs: { images } });
      } else if (attrsStr.includes('naya-buttons') || attrsStr.includes('sereia-buttons')) {
        const btnMatches = [...innerHtml.matchAll(/<a\s+href=["'](.*?)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        const buttons = btnMatches.map((bm) => ({
          url: bm[1],
          text: bm[2].replace(/<[^>]+>/g, '').trim(),
          style: (bm[0].includes('secondary') ? 'secondary' : bm[0].includes('outline') ? 'outline' : 'primary') as 'primary' | 'secondary' | 'outline',
        }));
        blocks.push({ id, type: 'buttons', content: '', attrs: { buttons: buttons.length > 0 ? buttons : [{ text: 'Button', url: '#', style: 'primary' }] } });
      } else if (attrsStr.includes('naya-embed') || attrsStr.includes('sereia-embed')) {
        blocks.push({ id, type: 'embed', content: '', attrs: { embedHtml: innerHtml } });
      } else {
        // Generic div -> if it contains text, treat as paragraph or html
        blocks.push({ id, type: 'html', content: match[0] });
      }
    } else if (tag === 'ul') {
      const liMatches = innerHtml.match(/<li>([\s\S]*?)<\/li>/gi);
      const content = liMatches
        ? liMatches.map((li) => li.replace(/^<li>/i, '').replace(/<\/li>$/i, '').trim()).join('\n')
        : '';
      blocks.push({ id, type: 'list-bullet', content });
    } else if (tag === 'ol') {
      const liMatches = innerHtml.match(/<li>([\s\S]*?)<\/li>/gi);
      const content = liMatches
        ? liMatches.map((li) => li.replace(/^<li>/i, '').replace(/<\/li>$/i, '').trim()).join('\n')
        : '';
      blocks.push({ id, type: 'list-number', content });
    } else if (tag === 'blockquote') {
      const pMatch = innerHtml.match(/<p>([\s\S]*?)<\/p>/i);
      const content = pMatch
        ? pMatch[1].trim()
        : innerHtml.replace(/<cite>[\s\S]*?<\/cite>/i, '').replace(/<[^>]+>/g, '').trim();
      const citeMatch = innerHtml.match(/<cite>([\s\S]*?)<\/cite>/i);
      const author = citeMatch ? citeMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      blocks.push({ id, type: 'quote', content, attrs: { author } });
    } else if (tag === 'hr') {
      blocks.push({ id, type: 'separator', content: '' });
    } else if (tag === 'video') {
      const srcMatch = (match[0]).match(/src=["'](.*?)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      blocks.push({ id, type: 'video', content: '', attrs: { url: src } });
    } else if (tag === 'iframe') {
      const srcMatch = attrsStr.match(/src=["'](.*?)["']/i);
      const src = srcMatch ? srcMatch[1] : '';
      if (src.includes('youtube.com/embed/')) {
        const yid = src.split('youtube.com/embed/')[1].split('?')[0].split('"')[0];
        blocks.push({ id, type: 'youtube', content: '', attrs: { youtubeId: yid } });
      } else {
        blocks.push({ id, type: 'embed', content: '', attrs: { embedUrl: src } });
      }
    } else {
      blocks.push({ id, type: 'html', content: match[0] });
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (!hasBlockTags) {
    blocks.push({
      id: `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'paragraph',
      content: html,
    });
  } else {
    const postText = html.substring(lastIndex).trim();
    if (postText) {
      blocks.push({
        id: `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'paragraph',
        content: postText,
      });
    }
  }

  return blocks;
}

