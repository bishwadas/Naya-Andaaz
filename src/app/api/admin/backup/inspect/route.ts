import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { inspectBackupZip } from '@/lib/backup-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Strict server-side authorization check (ADMIN role only)
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized: Only administrators can inspect backups.' },
        { status: auth.statusCode || 403 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No backup file provided in request.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Inspect ZIP
    const result = await inspectBackupZip(buffer);
    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Invalid backup archive.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      metadata: result.metadata,
      hasMediaFiles: result.hasMediaFiles,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('[Backup Inspect Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to inspect backup file.' },
      { status: 500 }
    );
  }
}
