import { NextRequest, NextResponse } from 'next/server';
import { createMediaItem, deleteMediaItem, getMedia, getMediaById } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';
import { deleteStoredFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await getMedia();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRequest('AUTHOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const body = await req.json();
    const newMedia = await createMediaItem(body);
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // 1. Fetch media record to safely remove physical file from persistent storage
    try {
      const existingMedia = await getMediaById(id);
      if (existingMedia) {
        const fileIdentifier = existingMedia.fileName || existingMedia.url;
        if (fileIdentifier) {
          await deleteStoredFile(fileIdentifier);
        }
      }
    } catch (lookupErr) {
      console.warn('Could not lookup media before delete:', lookupErr);
    }

    // 2. Delete database record
    const res = await deleteMediaItem(id);
    return NextResponse.json({ success: true, deleted: res });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
