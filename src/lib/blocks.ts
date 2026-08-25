export interface Block {
  id: string;
  type:
    | 'paragraph'
    | 'heading-h2'
    | 'heading-h3'
    | 'image'
    | 'gallery'
    | 'quote'
    | 'list-bullet'
    | 'list-number'
    | 'divider'
    | 'video'
    | 'youtube'
    | 'link'
    | 'button'
    | 'columns'
    | 'table-of-contents'
    | 'alsoRead'
    | 'faq'
    | 'html';
  content: string; // Text content or HTML
  postId?: string; // For alsoRead block
  items?: { question: string; answer: string }[]; // For faq block
  attrs?: {
    postId?: string;
    items?: { question: string; answer: string }[];
    url?: string;
    caption?: string;
    alt?: string;
    images?: { url: string; caption?: string }[];
    linkUrl?: string;
    linkText?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonAlign?: 'left' | 'center' | 'right';
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    author?: string;
    columns?: { id: string; blocks: Block[] }[];
    youtubeId?: string;
    autoplay?: boolean;
    aspectRatio?: '16-9' | '4-3' | '1-1';
  };
}

/**
 * Sanitize HTML to prevent arbitrary script injection and execution.
 * Removes <script> tags, onload/onerror events, and "javascript:" hrefs.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let cleaned = html;
  
  // Strip <script>...</script>
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Strip inline event handlers: e.g. onload, onerror, onclick
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');
  
  // Strip javascript: protocols in href, src, etc.
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');
  
  return cleaned;
}

/**
 * Compile a list of block elements into plain HTML text
 * to store in posts.content (backward compatibility + search index).
 */
export function serializeBlocksToHtml(blocks: Block[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content}</p>`;
          
        case 'heading-h2':
          return `<h2>${block.content}</h2>`;
          
        case 'heading-h3':
          return `<h3>${block.content}</h3>`;
          
        case 'image': {
          const src = block.attrs?.url || '';
          const alt = block.attrs?.alt || '';
          const cap = block.attrs?.caption || '';
          return `<figure><img src="${src}" alt="${alt}" />${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
        }
        
        case 'gallery': {
          const imgs = block.attrs?.images || [];
          const imgTags = imgs.map((img) => `<img src="${img.url}" alt="${img.caption || ''}" />`).join('');
          return `<div class="sereia-gallery">${imgTags}</div>`;
        }
        
        case 'quote':
          return `<blockquote><p>${block.content}</p>${block.attrs?.author ? `<cite>${block.attrs.author}</cite>` : ''}</blockquote>`;
          
        case 'list-bullet': {
          const items = block.content.split('\n').filter((l) => l.trim() !== '');
          const liTags = items.map((item) => `<li>${item}</li>`).join('');
          return `<ul>${liTags}</ul>`;
        }
        
        case 'list-number': {
          const items = block.content.split('\n').filter((l) => l.trim() !== '');
          const liTags = items.map((item) => `<li>${item}</li>`).join('');
          return `<ol>${liTags}</ol>`;
        }
        
        case 'divider':
          return '<hr />';
          
        case 'video':
          return `<video controls src="${block.attrs?.url || ''}"></video>`;
          
        case 'youtube': {
          const yid = block.attrs?.youtubeId || '';
          return `<iframe src="https://www.youtube.com/embed/${yid}" frameborder="0" allowfullscreen></iframe>`;
        }
        
        case 'link':
          return `<p><a href="${block.attrs?.linkUrl || '#'}">${block.attrs?.linkText || block.content || 'Link'}</a></p>`;
          
        case 'button': {
          const text = block.attrs?.buttonText || block.content || 'Button';
          const url = block.attrs?.buttonUrl || '#';
          const align = block.attrs?.buttonAlign || 'left';
          return `<div style="text-align: ${align}"><a href="${url}" class="sereia-btn">${text}</a></div>`;
        }
        
        case 'columns': {
          const cols = block.attrs?.columns || [];
          const colTags = cols
            .map((c) => `<div class="sereia-column">${serializeBlocksToHtml(c.blocks)}</div>`)
            .join('');
          return `<div class="sereia-columns">${colTags}</div>`;
        }
        
        case 'table-of-contents':
          return '<div class="sereia-toc">[Table of Contents]</div>';

        case 'alsoRead': {
          const pid = block.postId || block.attrs?.postId || '';
          return `<div class="sereia-also-read" data-post-id="${pid}">[Also Read: ${pid}]</div>`;
        }

        case 'faq': {
          const items = block.items || block.attrs?.items || [];
          return `<div class="sereia-faq">[FAQ Items: ${items.length}]</div>`;
        }

        case 'html':
          return sanitizeHtml(block.content);
          
        default:
          return '';
      }
    })
    .join('\n\n');
}

/**
 * Check if the content is pure HTML or if it should be parsed into blocks.
 * Parses plain old text/HTML posts into block structures.
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
      // Not JSON, continue to parse as HTML/plain-text
    }
  }
  
  // Fallback: Parse paragraphs by double-newlines
  const paragraphs = html.split('\n\n').filter((p) => p.trim() !== '');
  return paragraphs.map((p, idx) => {
    const text = p.trim();
    // Detect headings
    if (text.startsWith('<h2>') && text.endsWith('</h2>')) {
      return {
        id: `h2_${idx}_${Date.now()}`,
        type: 'heading-h2',
        content: text.substring(4, text.length - 5),
      };
    }
    if (text.startsWith('<h3>') && text.endsWith('</h3>')) {
      return {
        id: `h3_${idx}_${Date.now()}`,
        type: 'heading-h3',
        content: text.substring(4, text.length - 5),
      };
    }
    
    // Fallback as paragraph block
    return {
      id: `p_${idx}_${Date.now()}`,
      type: 'paragraph',
      content: text.replace(/<p>/gi, '').replace(/<\/p>/gi, ''),
    };
  });
}
