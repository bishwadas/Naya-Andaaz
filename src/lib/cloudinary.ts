import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  optimizedUrl: string;
}

/**
 * Sanitizes and normalizes the CLOUDINARY_URL string read from process.env.CLOUDINARY_URL.
 * Handles accidental prefix 'CLOUDINARY_URL=' or surrounding quotes gracefully.
 */
export function getSanitizedCloudinaryUrl(): string | null {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw || typeof raw !== 'string') return null;

  let url = raw.trim();
  if (!url) return null;

  // Strip accidental prefix if user pasted "CLOUDINARY_URL=cloudinary://..."
  if (url.startsWith('CLOUDINARY_URL=')) {
    url = url.slice('CLOUDINARY_URL='.length).trim();
  }

  // Strip surrounding quotes
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  if (!url.startsWith('cloudinary://')) {
    return null;
  }

  return url;
}

/**
 * Checks if CLOUDINARY_URL is present and correctly formatted without throwing errors.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(getSanitizedCloudinaryUrl());
}

/**
 * Lazy loads and configures the Cloudinary SDK client on demand.
 * This ensures no execution happens at module import or Next.js build time.
 */
export function getCloudinaryClient() {
  const raw = process.env.CLOUDINARY_URL;

  if (!raw || !raw.trim()) {
    throw new Error(
      'Missing Cloudinary configuration. Please set the CLOUDINARY_URL environment variable (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME).'
    );
  }

  const sanitizedUrl = getSanitizedCloudinaryUrl();
  if (!sanitizedUrl) {
    throw new Error(
      "Invalid CLOUDINARY_URL format. The environment variable must begin with 'cloudinary://' (expected format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)."
    );
  }

  // Update process.env.CLOUDINARY_URL to the sanitized URL so the SDK's internal initializer succeeds
  process.env.CLOUDINARY_URL = sanitizedUrl;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { v2: cloudinary } = require('cloudinary');

  cloudinary.config({
    cloudinary_url: sanitizedUrl,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads a file Buffer to Cloudinary with automatic optimization settings (f_auto, q_auto).
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    resourceType?: 'image' | 'raw' | 'video' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult> {
  const client = getCloudinaryClient();

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, any> = {
      folder: options.folder || 'sereia_cms',
      resource_type: options.resourceType || 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (options.filename) {
      const cleanName = options.filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      uploadOptions.public_id = `${cleanName}_${Date.now()}`;
    }

    const uploadStream = client.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          const errorMsg = error.message || 'Cloudinary upload failed';
          const httpCode = error.http_code;

          if (
            httpCode === 401 ||
            errorMsg.toLowerCase().includes('must supply api_key') ||
            errorMsg.toLowerCase().includes('invalid api key') ||
            errorMsg.toLowerCase().includes('unauthorized') ||
            errorMsg.toLowerCase().includes('cloud_name')
          ) {
            return reject(
              new Error(
                `Cloudinary authentication error: ${errorMsg}. Please verify your CLOUDINARY_URL environment variable credentials.`
              )
            );
          }

          if (
            httpCode === 400 &&
            (errorMsg.toLowerCase().includes('format') || errorMsg.toLowerCase().includes('invalid image'))
          ) {
            return reject(new Error(`Unsupported image format or invalid file: ${errorMsg}`));
          }

          if (errorMsg.toLowerCase().includes('file size') || errorMsg.toLowerCase().includes('exceeds')) {
            return reject(new Error(`File too large: ${errorMsg}`));
          }

          return reject(new Error(`Cloudinary upload failure: ${errorMsg}`));
        }

        if (!result) {
          return reject(new Error('Cloudinary upload returned no result.'));
        }

        const optimizedUrl = client.url(result.public_id, {
          secure: true,
          quality: 'auto',
          fetch_format: 'auto',
        });

        resolve({
          url: result.secure_url || result.url,
          secureUrl: result.secure_url || result.url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          optimizedUrl: optimizedUrl || result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Transforms a Cloudinary image URL to include f_auto,q_auto optimization parameters.
 */
export function getOptimizedCloudinaryUrl(url: string, transformations?: string): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  if (url.includes('/upload/')) {
    if (url.includes('/f_auto') || url.includes('/q_auto')) {
      return url;
    }
    const params = transformations || 'f_auto,q_auto';
    return url.replace('/upload/', `/upload/${params}/`);
  }

  return url;
}
