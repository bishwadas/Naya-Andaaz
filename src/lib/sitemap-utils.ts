export const DEFAULT_PRODUCTION_SITE_URL = 'https://www.nayaandaaz.com';
export const NEWS_PUBLICATION_NAME = 'Naya Andaaz';
export const NEWS_DEFAULT_LANGUAGE = 'en';

/**
 * Returns the centralized public canonical site URL.
 * Dynamically resolves from settings.siteUrl, environment variables, or defaults.
 * Always normalizes nayaandaaz.com to https://www.nayaandaaz.com.
 */
export function getSiteUrl(settings?: { siteUrl?: string } | null): string {
  let resolved: string | null = null;

  if (settings?.siteUrl && typeof settings.siteUrl === 'string') {
    const trimmed = settings.siteUrl.trim().replace(/\/+$/, '');
    if (trimmed && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
      resolved = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }
  }

  if (!resolved) {
    const configured =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (configured && typeof configured === 'string') {
      const trimmed = configured.trim().replace(/\/+$/, '');
      if (trimmed && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
        resolved = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      }
    }
  }

  if (!resolved) {
    resolved = DEFAULT_PRODUCTION_SITE_URL;
  }

  // Enforce canonical www.nayaandaaz.com domain
  if (resolved.includes('nayaandaaz.com') && !resolved.includes('www.nayaandaaz.com')) {
    resolved = resolved.replace('nayaandaaz.com', 'www.nayaandaaz.com');
  }

  if (resolved.startsWith('http://www.nayaandaaz.com')) {
    resolved = resolved.replace('http://', 'https://');
  }

  return resolved;
}

/**
 * Build clean, canonical absolute URL from a path or slug.
 * Removes extra slashes, fragments, query strings, and ensures correct base.
 */
export function formatCanonicalUrl(pathOrSlug: string, baseUrl: string = getSiteUrl()): string {
  if (!pathOrSlug) return baseUrl;

  // If already absolute
  if (/^https?:\/\//i.test(pathOrSlug)) {
    try {
      const parsed = new URL(pathOrSlug);
      // Strip search and hash
      parsed.search = '';
      parsed.hash = '';
      let clean = parsed.toString().replace(/\/+$/, '');
      if (clean.includes('localhost') || clean.includes('127.0.0.1')) {
        const pathPart = parsed.pathname.replace(/\/+$/, '');
        clean = `${baseUrl}${pathPart}`;
      } else if (clean.includes('nayaandaaz.com') && !clean.includes('www.nayaandaaz.com')) {
        clean = clean.replace('nayaandaaz.com', 'www.nayaandaaz.com');
      }
      return clean || baseUrl;
    } catch {
      // fallback
    }
  }

  const cleanPath = pathOrSlug
    .split('?')[0]
    .split('#')[0]
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Validates and normalizes an image URL for sitemaps.
 * Returns null if the URL is invalid or empty.
 */
export function cleanImageUrl(imageUrl: string | null | undefined, baseUrl: string = getSiteUrl()): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') {
    return null;
  }
  if (trimmed.startsWith('data:')) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      let res = parsed.toString();
      if (res.includes('nayaandaaz.com') && !res.includes('www.nayaandaaz.com')) {
        res = res.replace('nayaandaaz.com', 'www.nayaandaaz.com');
      }
      return res;
    } catch {
      return null;
    }
  }

  // Relative image path
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Format date into ISO 8601 string with Asia/Kolkata (+05:30) timezone offset.
 * Example: "2026-08-25T19:58:57+05:30"
 */
export function formatToISTISO(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) {
    return formatToISTISO(new Date());
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return formatToISTISO(new Date());
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');
  const second = getPart('second');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`;
}

/**
 * Get YYYY-MM in Asia/Kolkata (IST) timezone.
 */
export function getYearMonthInIST(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  });

  return formatter.format(date);
}

/**
 * Escape special XML characters in text or URLs.
 * Handles XML-incompatible control characters.
 */
export function escapeXml(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

/**
 * Extract and format keywords for Google News sitemap from tags and/or focus keyword.
 * Generates comma-separated keywords: "cycling,health,fitness,lifestyle".
 * Returns empty string if no keywords exist.
 */
export function formatNewsKeywords(
  tags?: Array<{ name?: string; slug?: string } | string> | null,
  focusKeyword?: string | null,
  metaKeywords?: string | null
): string {
  const keywordSet = new Set<string>();

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      const name = typeof tag === 'string' ? tag : tag?.name || tag?.slug;
      if (name && typeof name === 'string') {
        const clean = name.trim();
        if (clean && clean !== 'null' && clean !== 'undefined' && clean !== '[object Object]') {
          keywordSet.add(clean);
        }
      }
    }
  }

  if (focusKeyword && typeof focusKeyword === 'string') {
    const parts = focusKeyword.split(',').map((k) => k.trim());
    for (const p of parts) {
      if (p && p !== 'null' && p !== 'undefined') {
        keywordSet.add(p);
      }
    }
  }

  if (keywordSet.size === 0 && metaKeywords && typeof metaKeywords === 'string') {
    const parts = metaKeywords.split(',').map((k) => k.trim());
    for (const p of parts) {
      if (p && p !== 'null' && p !== 'undefined') {
        keywordSet.add(p);
      }
    }
  }

  if (keywordSet.size === 0) return '';
  return escapeXml(Array.from(keywordSet).join(','));
}
