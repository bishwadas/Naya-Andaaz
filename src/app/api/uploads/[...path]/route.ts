import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUploadsDir, getMimeTypeFromExt } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    if (!pathSegments || !Array.isArray(pathSegments) || pathSegments.length === 0) {
      return new NextResponse('File path required', { status: 400 });
    }

    const uploadsDir = path.resolve(getUploadsDir());
    const requestedRelativePath = path.join(...pathSegments);
    const absoluteFilePath = path.resolve(uploadsDir, requestedRelativePath);

    // Security check: prevent directory traversal
    if (!absoluteFilePath.startsWith(uploadsDir)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    if (!fs.existsSync(absoluteFilePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stats = await fs.promises.stat(absoluteFilePath);
    if (stats.isDirectory()) {
      return new NextResponse('Invalid target', { status: 400 });
    }

    const ext = path.extname(absoluteFilePath).toLowerCase();
    const mimeType = getMimeTypeFromExt(ext);
    const fileBuffer = await fs.promises.readFile(absoluteFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': stats.mtime.toUTCString(),
        'ETag': `"${stats.size}-${stats.mtimeMs}"`,
      },
    });
  } catch (error: any) {
    console.error('Error serving uploaded media:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function HEAD(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const uploadsDir = path.resolve(getUploadsDir());
    const requestedRelativePath = path.join(...pathSegments);
    const absoluteFilePath = path.resolve(uploadsDir, requestedRelativePath);

    if (!absoluteFilePath.startsWith(uploadsDir) || !fs.existsSync(absoluteFilePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stats = await fs.promises.stat(absoluteFilePath);
    const ext = path.extname(absoluteFilePath).toLowerCase();
    const mimeType = getMimeTypeFromExt(ext);

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
