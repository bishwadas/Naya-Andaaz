import { NextRequest, NextResponse } from 'next/server';
import { getTrashedItems, restoreAllTrash, emptyTrash } from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getTrashedItems();
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching trash:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'restore-all') {
      await restoreAllTrash();
      return NextResponse.json({ success: true });
    } else if (body.action === 'empty') {
      await emptyTrash();
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing trash batch action:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
