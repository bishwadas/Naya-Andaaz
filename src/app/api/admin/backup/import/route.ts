import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { restoreBackupZip, ImportMode } from '@/lib/backup-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Strict server-side authorization check (ADMIN role only)
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized: Only administrators can import database backups.' },
        { status: auth.statusCode || 403 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as ImportMode) || 'skip';

    if (!file) {
      return NextResponse.json({ error: 'No backup file provided in request.' }, { status: 400 });
    }

    if (!['skip', 'update', 'create_new'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid import mode. Must be "skip", "update", or "create_new".' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Perform safe, transaction-based database restoration
    const result = await restoreBackupZip(buffer, mode, auth.user.userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[Backup Import Error]', error);
    return NextResponse.json(
      {
        error: error.message || 'Database restoration failed. All changes have been rolled back.',
      },
      { status: 500 }
    );
  }
}
