import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { createMediaItem } from '@/db/repository';
import { saveUploadedFile } from '@/lib/storage';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'video/mp4',
  'video/webm',
];

const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.ico', '.mp4', '.webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function isSvgMalicious(svgText: string): boolean {
  const lower = svgText.toLowerCase();

  const forbiddenPatterns = [
    /<script\b/i,
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /on\w+\s*=/i,
    /<foreignobject\b/i,
    /<embed\b/i,
    /<object\b/i,
    /<iframe\b/i,
    /eval\s*\(/i,
  ];

  return forbiddenPatterns.some((pattern) => pattern.test(lower));
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Authorization required for media upload' },
        { status: auth.statusCode || 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const folder = (formData.get('folder') as string) || 'images';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File Size Check (25 MB max)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 25MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const mime = (file.type || 'image/jpeg').toLowerCase();

    // File Type & Format Check
    if ((ext && !ALLOWED_EXTENSIONS.includes(ext)) || (mime && !ALLOWED_MIME_TYPES.includes(mime))) {
      return NextResponse.json(
        { error: `Unsupported format or invalid file type (${file.type || ext}). Allowed formats: JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SVG Security Check
    if (ext === '.svg' || mime === 'image/svg+xml') {
      const svgText = buffer.toString('utf-8');
      if (isSvgMalicious(svgText)) {
        return NextResponse.json(
          { error: 'Security alert: Uploaded SVG contains unsafe scripts or interactive attributes.' },
          { status: 400 }
        );
      }
    }

    // Determine subfolder: 'images' or 'media'
    const isImage = mime.startsWith('image/');
    const subfolder = isImage ? 'images' : 'media';

    // Save physically to Persistent Volume (under /data/uploads/images or /data/uploads/media)
    const saved = await saveUploadedFile(buffer, file.name, {
      subfolder,
      mimeType: file.type || mime,
    });

    const mediaTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');

    // Save media record in SQLite database
    let savedMediaItem = null;
    try {
      savedMediaItem = await createMediaItem({
        title: mediaTitle,
        fileName: saved.fileName,
        url: saved.url,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
        altText: altText || mediaTitle,
        caption: caption,
        uploadedBy: auth.user?.userId || 'usr_admin_01',
        uploadedByName: auth.user?.name || 'Admin',
      });
    } catch (dbErr) {
      console.warn('Media record creation in DB failed, but file was saved:', dbErr);
    }

    return NextResponse.json({
      success: true,
      url: saved.url,
      secureUrl: saved.url,
      publicId: saved.fileName,
      fileName: saved.fileName,
      fileSize: saved.fileSize,
      mimeType: saved.mimeType,
      provider: 'persistent_storage',
      media: savedMediaItem,
    });
  } catch (error: any) {
    console.error('Error in media upload API:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
