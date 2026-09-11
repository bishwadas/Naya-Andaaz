/**
 * Image optimization utilities for responsive sizing and next-gen format delivery (AVIF/WebP).
 * Seamlessly handles Cloudinary URLs, Unsplash URLs, and generic image sources.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto' | 'auto:good' | 'auto:eco';
  crop?: 'fill' | 'limit' | 'fit' | 'thumb';
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
}

/**
 * Transforms an image URL to deliver optimized formats and exact dimensions.
 * For Cloudinary URLs: injects f_auto, q_auto, and width/height constraints into the upload path.
 * For Unsplash URLs: sets auto=format, q, and w parameters.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width?: number,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
  }

  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
  }

  // 1. Cloudinary URL optimization
  if (cleanUrl.includes('res.cloudinary.com')) {
    if (cleanUrl.includes('/upload/')) {
      const parts: string[] = [];

      // Format & quality
      const fmt = options.format || 'auto';
      const q = options.quality || 'auto:good';
      parts.push(`f_${fmt}`);
      parts.push(`q_${q}`);

      // Dimensions
      if (width) {
        parts.push(`w_${Math.round(width)}`);
      }
      if (options.height) {
        parts.push(`h_${Math.round(options.height)}`);
      }

      // Crop mode (default to limit if resizing to avoid stretching, or fill if both dimensions set)
      if (options.crop) {
        parts.push(`c_${options.crop}`);
      } else if (width && options.height) {
        parts.push('c_fill,g_auto');
      } else if (width) {
        parts.push('c_limit');
      }

      const transformSegment = parts.join(',');

      // If URL already contains transformation segments after /upload/, replace them or prepend
      if (cleanUrl.match(/\/upload\/[a-z0-9_,:]+\//i)) {
        // Already transformed, replace previous transformations
        return cleanUrl.replace(/\/upload\/[a-z0-9_,:]+\//i, `/upload/${transformSegment}/`);
      }

      return cleanUrl.replace('/upload/', `/upload/${transformSegment}/`);
    }
    return cleanUrl;
  }

  // 2. Unsplash URL optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(cleanUrl);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', options.crop === 'fill' ? 'crop' : 'max');
      if (width) {
        parsed.searchParams.set('w', String(Math.round(width)));
      }
      if (options.height) {
        parsed.searchParams.set('h', String(Math.round(options.height)));
      }
      const qVal = typeof options.quality === 'number' ? options.quality : 70;
      parsed.searchParams.set('q', String(qVal));
      return parsed.toString();
    } catch {
      return cleanUrl;
    }
  }

  // 3. Generic image URLs
  return cleanUrl;
}

/**
 * Builds a responsive srcset string for a given image source across multiple screen widths.
 */
export function getResponsiveImageSrcSet(
  url: string | null | undefined,
  widths: number[] = [360, 640, 960, 1200],
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, options)} ${w}w`)
    .join(', ');
}
