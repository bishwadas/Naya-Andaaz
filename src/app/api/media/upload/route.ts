import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { createMediaItem } from '@/db/repository';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
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
];

const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.ico'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

    // Check Cloudinary Configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            'Missing Cloudinary configuration. Please configure the CLOUDINARY_URL environment variable in your environment settings.',
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const folder = (formData.get('folder') as string) || 'sereia_cms';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File Size Check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 10MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const mime = file.type.toLowerCase();

    // File Type & Format Check
    if ((ext && !ALLOWED_EXTENSIONS.includes(ext)) || (mime && !ALLOWED_MIME_TYPES.includes(mime))) {
      return NextResponse.json(
        { error: `Unsupported format or invalid file type (${file.type || ext}). Allowed formats: SVG, PNG, JPG, WebP, GIF, AVIF, ICO.` },
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

    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(buffer, {
        filename: file.name,
        folder: folder,
      });
    } catch (cErr: any) {
      console.error('Cloudinary upload error:', cErr);
      const msg = cErr.message || 'Cloudinary upload failed';
      const isAuthError =
        msg.includes('authentication') || msg.includes('CLOUDINARY_URL') || msg.includes('api_key');
      return NextResponse.json(
        { error: msg },
        { status: isAuthError ? 401 : 500 }
      );
    }

    const imageUrl = cloudinaryResult.optimizedUrl || cloudinaryResult.secureUrl;
    const mediaTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');

    // Save URL and metadata in Database
    let savedMediaItem = null;
    try {
      savedMediaItem = await createMediaItem({
        title: mediaTitle,
        fileName: cloudinaryResult.publicId || file.name,
        url: imageUrl,
        mimeType: file.type || 'image/png',
        fileSize: cloudinaryResult.bytes || file.size,
        altText: altText || mediaTitle,
        caption: caption,
        uploadedBy: auth.user?.userId || 'usr_admin_01',
        uploadedByName: auth.user?.name || 'Admin',
      });
    } catch (dbErr) {
      console.warn('Media record creation in DB failed, but Cloudinary upload succeeded:', dbErr);
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      secureUrl: cloudinaryResult.secureUrl,
      publicId: cloudinaryResult.publicId,
      fileName: cloudinaryResult.publicId,
      fileSize: cloudinaryResult.bytes || file.size,
      mimeType: file.type,
      media: savedMediaItem,
    });
  } catch (error: any) {
    console.error('Error in media upload API:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

