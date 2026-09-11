import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { generateBackupZip } from '@/lib/backup-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Strict server-side authorization check (ADMIN role only)
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized: Only administrators can export backups.' },
        { status: auth.statusCode || 403 }
      );
    }

    // 2. Generate ZIP with database.json and media files
    const { buffer, filename, metadata } = await generateBackupZip();

    // 3. Return downloadable ZIP stream
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Version': metadata.backupVersion,
        'X-Backup-App': metadata.appName,
        'X-Backup-Date': metadata.exportedAt,
      },
    });
  } catch (error: any) {
    console.error('[Backup Export Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate database backup' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
