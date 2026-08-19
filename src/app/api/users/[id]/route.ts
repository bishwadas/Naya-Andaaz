import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getUserById, updateUser } from '@/db/repository';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatePayload: any = { ...body };
    if (body.password) {
      updatePayload.passwordHash = await hashPassword(body.password);
      delete updatePayload.password;
    }

    const updated = await updateUser(id, updatePayload);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
