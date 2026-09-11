import { NextRequest, NextResponse } from 'next/server';
import { updateMenuItems } from '@/db/repository';

export const dynamic = 'force-dynamic';


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await updateMenuItems(id, body.items || []);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating menu items:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
