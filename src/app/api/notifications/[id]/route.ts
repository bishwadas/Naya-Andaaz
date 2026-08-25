import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { markNotificationAsRead } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await markNotificationAsRead(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await markNotificationAsRead(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error patching notification:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(notifications).where(eq(notifications.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
