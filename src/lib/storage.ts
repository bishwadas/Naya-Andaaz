import fs from 'fs';
import path from 'path';

/**
 * Storage configuration for Railway Persistent Volume and local development.
 * Default persistent volume mount point: /data
 * Default uploads directory: /data/uploads (or ./data/uploads in local dev)
 */
export function getPersistentDataDir(): string {
  if (process.env.DATA_DIR && process.env.DATA_DIR.trim().length > 0) {
    const custom = process.env.DATA_DIR.trim();
    return path.isAbsolute(custom) ? custom : path.resolve(process.cwd(), custom);
  }

  // Check if standard Railway / Cloud persistent volume /data exists
  try {
    if (fs.existsSync('/data') && fs.statSync('/data').isDirectory()) {
      return '/data';
    }
  } catch {
    // Ignore and fallback
  }

  return path.resolve(process.cwd(), 'data');
}

export function getUploadsDir(): string {
  if (process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim().length > 0) {
    const custom = process.env.UPLOAD_DIR.trim();
    return path.isAbsolute(custom) ? custom : path.resolve(process.cwd(), custom);
  }

  const dataDir = getPersistentDataDir();
  return path.join(dataDir, 'uploads');
}

export function ensureStorageDirectories(): {
  dataDir: string;
  uploadsDir: string;
  imagesDir: string;
  mediaDir: string;
} {
  const dataDir = getPersistentDataDir();
  const uploadsDir = getUploadsDir();
  const imagesDir = path.join(uploadsDir, 'images');
  const mediaDir = path.join(uploadsDir, 'media');

  for (const dir of [dataDir, uploadsDir, imagesDir, mediaDir]) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      console.warn(`[Storage] Warning ensuring directory ${dir}:`, err);
    }
  }

  return { dataDir, uploadsDir, imagesDir, mediaDir };
}

export interface SavedFileResult {
  fileName: string;
  subPath: string;
  absolutePath: string;
  url: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Sanitize filename to avoid path traversal and invalid filesystem characters.
 */
export function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  const ext = path.extname(base).toLowerCase();
  const nameWithoutExt = path.basename(base, ext);
  const cleanName = nameWithoutExt
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80);
  return `${cleanName || 'file'}${ext}`;
}

/**
 * Save uploaded buffer to persistent volume under /uploads/images/ or /uploads/media/
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename: string,
  options: {
    subfolder?: 'images' | 'media';
    mimeType?: string;
  } = {}
): Promise<SavedFileResult> {
  const { uploadsDir } = ensureStorageDirectories();
  const subfolder = options.subfolder || 'images';
  const targetDir = path.join(uploadsDir, subfolder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const sanitized = sanitizeFileName(originalFilename);
  const ext = path.extname(sanitized).toLowerCase() || '.jpg';
  const baseName = path.basename(sanitized, ext);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const finalFileName = `${baseName}_${uniqueSuffix}${ext}`;
  const absolutePath = path.join(targetDir, finalFileName);

  await fs.promises.writeFile(absolutePath, buffer);

  const stats = await fs.promises.stat(absolutePath);
  const subPath = `${subfolder}/${finalFileName}`;
  const url = `/api/uploads/${subPath}`;

  return {
    fileName: finalFileName,
    subPath,
    absolutePath,
    url,
    fileSize: stats.size,
    mimeType: options.mimeType || getMimeTypeFromExt(ext),
  };
}

/**
 * Delete a file safely from persistent volume.
 * Ensures the target path is strictly within the UPLOAD_DIR to prevent directory traversal.
 */
export async function deleteStoredFile(fileUrlOrSubPath: string): Promise<boolean> {
  try {
    if (!fileUrlOrSubPath) return false;

    const uploadsDir = path.resolve(getUploadsDir());
    let relativeSubPath = fileUrlOrSubPath.trim();

    // Strip URL prefix if present
    if (relativeSubPath.startsWith('/api/uploads/')) {
      relativeSubPath = relativeSubPath.replace(/^\/api\/uploads\//, '');
    } else if (relativeSubPath.startsWith('/uploads/')) {
      relativeSubPath = relativeSubPath.replace(/^\/uploads\//, '');
    }

    const targetPath = path.resolve(uploadsDir, relativeSubPath);

    // Security check: ensure targetPath is within uploadsDir
    if (!targetPath.startsWith(uploadsDir)) {
      console.warn(`[Storage] Refusing to delete path outside uploads dir: ${targetPath}`);
      return false;
    }

    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[Storage] Error deleting stored file:', err);
    return false;
  }
}

export function getMimeTypeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}
