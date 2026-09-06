import type { Metadata } from 'next';
import { SiteSettings, Post, Category, Tag, User } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/constants';
import { getSiteUrl, formatCanonicalUrl, cleanImageUrl } from '@/lib/sitemap-utils';

/**
 * Strip HTML tags and normalize whitespace into clean plain text.
 */
export function stripHtmlToPlainText(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<!--[\s\S]*?-->/g, '') // remove HTML/block comments
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // remove styles
    .replace(/<[^>]+>/g, ' ') // replace tags with space
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ') // collapse multi-whitespace
    .trim();
}

/**
 * Extract clean plain text excerpt from article content or blocks with configurable max length.
 */
export function extractArticleExcerpt(post: Partial<Post>, maxLength: number = 160): string {
  // 1. If explicit excerpt exists, clean and return
  if (post.excerpt && typeof post.excerpt === 'string') {
    const clean = stripHtmlToPlainText(post.excerpt);
    if (clean.length > 0) {
      return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1).trim()}…`;
    }
  }

  // 2. Extract from blocks if available
  if (Array.isArray(post.blocks) && post.blocks.length > 0) {
    const textParts: string[] = [];
    for (const block of post.blocks) {
      if (block.type === 'paragraph' || block.type === 'heading-h2' || block.type === 'heading-h3' || block.type === 'quote') {
        const text = stripHtmlToPlainText(block.content);
        if (text) textParts.push(text);
      }
    }
    const combined = textParts.join(' ').trim();
    if (combined.length > 0) {
      return combined.length <= maxLength ? combined : `${combined.slice(0, maxLength - 1).trim()}…`;
    }
  }

  // 3. Extract from raw content
  if (post.content && typeof post.content === 'string') {
    const clean = stripHtmlToPlainText(post.content);
    if (clean.length > 0) {
      return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1).trim()}…`;
    }
  }

  return '';
}

/**
 * Resolve the dynamic base site URL from existing site settings, environment variables, or defaults.
 * Does not hardcode any domain and stays synced with Admin > Settings > Base Site URL.
 */
export function resolveSiteUrl(settings?: Partial<SiteSettings> | null): string {
  return getSiteUrl(settings);
}

/**
 * Resolve the dynamic site name / brand from existing site settings.
 */
export function resolveSiteName(settings?: Partial<SiteSettings> | null): string {
  const name = settings?.siteName || DEFAULT_SITE_SETTINGS.siteName;
  return typeof name === 'string' && name.trim() ? name.trim() : 'Naya Andaaz';
}

/**
 * Resolve the dynamic site description from existing site settings.
 * Prioritizes the configured Default Meta Description in Admin Settings -> Default SEO,
 * then falls back to portal description (siteDescription), and then to default constants.
 */
export function resolveSiteDescription(settings?: Partial<SiteSettings> | null): string {
  const desc =
    settings?.defaultMetaDescription ||
    settings?.siteDescription ||
    DEFAULT_SITE_SETTINGS.defaultMetaDescription ||
    DEFAULT_SITE_SETTINGS.siteDescription;
  return typeof desc === 'string' && desc.trim() ? desc.trim() : '';
}

/**
 * Resolve the dynamic site title pattern from existing site settings.
 */
export function resolveSiteTitle(settings?: Partial<SiteSettings> | null): string {
  const title =
    settings?.defaultSeoTitle ||
    settings?.siteTitle ||
    DEFAULT_SITE_SETTINGS.defaultSeoTitle;
  if (typeof title === 'string' && title.trim()) {
    return title.trim();
  }
  const siteName = resolveSiteName(settings);
  const siteDesc = resolveSiteDescription(settings);
  return siteDesc ? `${siteName} | ${siteDesc}` : siteName;
}

/**
 * Resolve primary logo URL into an absolute URL.
 */
export function resolveLogoUrl(settings?: Partial<SiteSettings> | null, baseUrl?: string): string {
  const base = baseUrl || resolveSiteUrl(settings);
  const rawLogo =
    settings?.logo ||
    settings?.logo_url ||
    settings?.logoPrimary ||
    DEFAULT_SITE_SETTINGS.logo;
  return cleanImageUrl(rawLogo, base) || `${base}/logo.svg`;
}

/**
 * Resolve favicon URL into an absolute or relative icon path.
 */
export function resolveFaviconUrl(settings?: Partial<SiteSettings> | null): string {
  const raw = settings?.favicon || DEFAULT_SITE_SETTINGS.favicon;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : '/favicon.ico';
}

/**
 * Generate schema.org/WebSite JSON-LD for Google Site Name extraction.
 * Google uses this primary signal to display the custom site name (e.g. "Naya Andaaz")
 * instead of falling back to the hosting platform's domain name.
 */
export function generateWebSiteJsonLd(settings?: Partial<SiteSettings> | null) {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const description = resolveSiteDescription(settings);

  // Google Site Names guideline:
  // 1. name: Official site name ("Naya Andaaz")
  // 2. alternateName: Acronym or compressed name (e.g. "NayaAndaaz").
  // Never repeat name or stuff taglines/slogans into alternateName!
  const compressedName = siteName.replace(/\s+/g, '');
  const alternateNames: string[] = [];
  if (compressedName && compressedName.toLowerCase() !== siteName.toLowerCase()) {
    alternateNames.push(compressedName);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: alternateNames.length > 0 ? alternateNames : undefined,
    url: baseUrl,
    description: description || undefined,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: resolveLogoUrl(settings, baseUrl),
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate schema.org/NewsMediaOrganization (or Organization) JSON-LD.
 */
export function generateOrganizationJsonLd(settings?: Partial<SiteSettings> | null) {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const logoUrl = resolveLogoUrl(settings, baseUrl);

  // Extract enabled social profiles, sanitizing any legacy brand handles
  const socialUrls: string[] = [];
  const addSocial = (url?: string | null) => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (!trimmed || trimmed.toLowerCase().includes('sereia')) return;
    if (!socialUrls.includes(trimmed)) socialUrls.push(trimmed);
  };

  if (Array.isArray(settings?.socialLinks)) {
    for (const link of settings.socialLinks) {
      if (link?.isEnabled && link?.url) {
        addSocial(link.url);
      }
    }
  }
  addSocial(settings?.facebookUrl);
  // Default to official Naya Andaaz Twitter if DB had old sereianews handle
  const rawTwitter = settings?.twitterUrl;
  if (rawTwitter && !rawTwitter.toLowerCase().includes('sereia')) {
    addSocial(rawTwitter);
  } else {
    addSocial('https://twitter.com/nayaandaaznews');
  }
  addSocial(settings?.instagramUrl);
  addSocial(settings?.youtubeUrl);
  addSocial(settings?.pinterestUrl);
  addSocial(settings?.linkedinUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteName,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    sameAs: socialUrls.length > 0 ? socialUrls : undefined,
    contactPoint: settings?.contactEmail
      ? {
          '@type': 'ContactPoint',
          email: settings.contactEmail,
          contactType: 'editorial support',
        }
      : undefined,
  };
}

/**
 * Generate schema.org/NewsArticle JSON-LD for individual article posts.
 * Includes complete Google Search rich result properties.
 */
export function generateArticleJsonLd(post: Post, settings?: Partial<SiteSettings> | null) {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const logoUrl = resolveLogoUrl(settings, baseUrl);

  const subCatSlug = post.subCategory?.slug || post.category?.slug || 'uncategorized';
  const postUrl = post.canonicalUrl
    ? formatCanonicalUrl(post.canonicalUrl, baseUrl)
    : formatCanonicalUrl(`/${subCatSlug}/${post.slug}`, baseUrl);

  const imageUrl =
    cleanImageUrl(post.ogImage, baseUrl) ||
    cleanImageUrl(post.featuredImage, baseUrl) ||
    cleanImageUrl(settings?.defaultOgImage, baseUrl);

  const authorName = post.author?.name || 'Editorial Staff';
  const authorUrl = post.author?.username ? `${baseUrl}/author/${post.author.username}` : undefined;

  const fallbackDesc = resolveSiteDescription(settings);
  const resolvedDesc =
    (post.metaDescription && post.metaDescription.trim())
      ? post.metaDescription.trim()
      : extractArticleExcerpt(post, 160) || fallbackDesc;

  const tagsList = Array.isArray(post.tags)
    ? post.tags
        .map((t: any) => (typeof t === 'string' ? t.trim() : t?.name || t?.slug || ''))
        .filter(Boolean)
    : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.seoTitle || post.title,
    description: resolvedDesc || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    articleSection: post.category?.name || post.subCategory?.name || undefined,
    keywords: tagsList.length > 0 ? tagsList.join(', ') : (post.focusKeyword || undefined),
  };
}

/**
 * Generate schema.org/FAQPage JSON-LD for articles or pages containing FAQ accordions.
 */
export function generateFaqJsonLd(
  faqItems: Array<{ question: string; answer: string }>
) {
  if (!Array.isArray(faqItems) || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: stripHtmlToPlainText(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtmlToPlainText(item.answer),
      },
    })),
  };
}

/**
 * Generate schema.org/BreadcrumbList JSON-LD.
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string; url?: string }>,
  settings?: Partial<SiteSettings> | null
) {
  const baseUrl = resolveSiteUrl(settings);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: formatCanonicalUrl(item.path || item.url || '/', baseUrl),
    })),
  };
}

/**
 * Generate schema.org/CollectionPage JSON-LD for category, subcategory, or tag archives.
 */
export function generateCollectionJsonLd(
  name: string,
  description: string,
  url: string,
  posts?: Post[],
  settings?: Partial<SiteSettings> | null
) {
  const baseUrl = resolveSiteUrl(settings);
  const fullUrl = formatCanonicalUrl(url, baseUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || undefined,
    url: fullUrl,
    mainEntity: posts && posts.length > 0
      ? {
          '@type': 'ItemList',
          itemListElement: posts.slice(0, 10).map((post, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: formatCanonicalUrl(`/${post.subCategory?.slug || post.category?.slug || 'uncategorized'}/${post.slug}`, baseUrl),
            name: post.title,
          })),
        }
      : undefined,
  };
}

/**
 * Generate schema.org/ProfilePage and Person JSON-LD for author archive pages.
 */
export function generateAuthorJsonLd(
  author: Partial<User>,
  settings?: Partial<SiteSettings> | null
) {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const authorSlug = author.username || author.id || 'profile';
  const authorUrl = formatCanonicalUrl(`/author/${authorSlug}`, baseUrl);
  const authorName = author.name || 'Author';

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
      image: author.avatar ? cleanImageUrl(author.avatar, baseUrl) : undefined,
      description: author.bio || undefined,
      worksFor: {
        '@type': 'NewsMediaOrganization',
        name: siteName,
        url: baseUrl,
      },
    },
  };
}

/**
 * Generate schema.org/WebPage JSON-LD for static or dynamic pages.
 */
export function generatePageJsonLd(
  page: { title: string; slug: string; content?: string; metaDescription?: string; seoTitle?: string; publishedAt?: string; updatedAt?: string },
  settings?: Partial<SiteSettings> | null
) {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const pagePath = page.slug === 'privacy-policy' ? '/privacy-policy' : `/page/${page.slug}`;
  const pageUrl = formatCanonicalUrl(pagePath, baseUrl);

  const rawTitle = page.seoTitle || page.title;
  const cleanTitle = rawTitle.replace(/Sereia/gi, siteName).trim();

  const rawDesc =
    page.metaDescription?.trim() ||
    stripHtmlToPlainText(page.content).slice(0, 160) ||
    resolveSiteDescription(settings);
  const cleanDesc = rawDesc
    .replace(/Sereia/gi, siteName)
    .replace(/[a-zA-Z0-9._%+-]+@sereia\.news/gi, 'hello@nayaandaaz.com')
    .replace(/https?:\/\/sereia\.news/gi, baseUrl)
    .trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: cleanTitle,
    description: cleanDesc || undefined,
    url: pageUrl,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: resolveLogoUrl(settings, baseUrl),
      },
    },
    datePublished: page.publishedAt || undefined,
    dateModified: page.updatedAt || page.publishedAt || undefined,
  };
}

/**
 * Resolve complete dynamic Next.js Metadata for an Article Post with full fallback hierarchy.
 */
export function resolveArticleMetadata(
  post: Post,
  settings?: Partial<SiteSettings> | null
): Metadata {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const subCatSlug = post.subCategory?.slug || post.category?.slug || 'uncategorized';
  
  // 1. Dynamic Canonical URL
  const canonicalUrl = post.canonicalUrl
    ? formatCanonicalUrl(post.canonicalUrl, baseUrl)
    : formatCanonicalUrl(`/${subCatSlug}/${post.slug}`, baseUrl);

  // 2. Dynamic Title Fallback Hierarchy:
  // (1) post.seoTitle -> (2) post.title -> (3) post.title | siteName
  const title = (post.seoTitle && post.seoTitle.trim())
    ? post.seoTitle.trim()
    : post.title
    ? `${post.title}`
    : siteName;

  // 3. Dynamic Meta Description Fallback Hierarchy:
  // (1) post.metaDescription -> (2) post.excerpt -> (3) auto-generated content excerpt -> (4) site description
  const fallbackSiteDesc = resolveSiteDescription(settings);
  const contentExcerpt = extractArticleExcerpt(post, 160);
  const description =
    (post.metaDescription && post.metaDescription.trim())
      ? post.metaDescription.trim()
      : (post.excerpt && post.excerpt.trim())
      ? post.excerpt.trim()
      : contentExcerpt || fallbackSiteDesc;

  // 4. Dynamic OG / Featured Image Fallback Hierarchy:
  // (1) post.ogImage -> (2) post.featuredImage -> (3) settings.defaultOgImage -> (4) site logo
  const ogImage =
    cleanImageUrl(post.ogImage, baseUrl) ||
    cleanImageUrl(post.featuredImage, baseUrl) ||
    cleanImageUrl(settings?.defaultOgImage, baseUrl) ||
    resolveLogoUrl(settings, baseUrl);

  const tagsList = Array.isArray(post.tags)
    ? post.tags
        .map((t: any) => (typeof t === 'string' ? t.trim() : t?.name || t?.slug || ''))
        .filter(Boolean)
    : [];

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      siteName,
      title,
      description,
      url: canonicalUrl,
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      section: post.category?.name || post.subCategory?.name || undefined,
      tags: tagsList.length > 0 ? tagsList : undefined,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: post.title || siteName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

/**
 * Resolve complete dynamic Next.js Metadata for Category / Subcategory Archives.
 */
export function resolveCategoryMetadata(
  category: Category,
  parentCategory?: Category | null,
  settings?: Partial<SiteSettings> | null
): Metadata {
  const siteName = resolveSiteName(settings);
  const baseUrl = resolveSiteUrl(settings);
  const fallbackDesc = resolveSiteDescription(settings);

  const isSubcategory = Boolean(parentCategory && category.parentId);
  const canonicalPath = isSubcategory
    ? `/${parentCategory!.slug}/${category.slug}`
    : `/${category.slug}`;
  const canonicalUrl = formatCanonicalUrl(canonicalPath, baseUrl);

  // Dynamic Title Hierarchy
  const title = (category.seoTitle && category.seoTitle.trim())
    ? category.seoTitle.trim()
    : isSubcategory
    ? `${category.name} — ${parentCategory!.name}`
    : `${category.name}`;

  // Dynamic Description Hierarchy
  const description =
    (category.metaDescription && category.metaDescription.trim())
      ? category.metaDescription.trim()
      : (category.description && category.description.trim())
      ? category.description.trim()
      : isSubcategory
      ? `Browse latest stories, analysis, and articles in ${category.name} on ${siteName}.`
      : `Explore ${category.name} news, top headlines, and features on ${siteName}.` || fallbackDesc;

  // Dynamic OG Image
  const ogImage =
    cleanImageUrl(category.image, baseUrl) ||
    cleanImageUrl(settings?.defaultOgImage, baseUrl) ||
    resolveLogoUrl(settings, baseUrl);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url: canonicalUrl,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

