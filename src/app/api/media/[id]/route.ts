import { NextRequest, NextResponse } from 'next/server';
import { deleteMedia, getMediaById } from '@/db/repository';
import { authorizeRequest } from '@/lib/auth';
import { deleteStoredFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest('EDITOR');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 403 });
    }

    const { id } = await params;

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
    await deleteMedia(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
