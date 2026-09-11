import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getUserById, updateUser } from '@/db/repository';
import { authorizeRequest, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest('SUBSCRIBER');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const isSelf = auth.user.userId === id;
    const isPrivileged = ['ADMIN', 'SUPERADMIN', 'EDITOR'].includes((auth.user.role || '').toUpperCase());

    if (!isSelf && !isPrivileged) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const auth = await authorizeRequest('SUBSCRIBER');
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const isSelf = auth.user.userId === id;
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes((auth.user.role || '').toUpperCase());

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updatePayload: any = { ...body };

    // Prevent non-admins from escalating their role
    if (body.role && !isAdmin) {
      delete updatePayload.role;
    }

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
    const auth = await authorizeRequest('ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
