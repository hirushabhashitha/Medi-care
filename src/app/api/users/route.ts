import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMINISTRATOR') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMINISTRATOR') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, email, password, role, firstName, lastName, departmentId, designation } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'Username, email, password, and role are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        employee: firstName
          ? {
              create: {
                employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                firstName,
                lastName: lastName || '',
                departmentId: departmentId || null,
                designation: designation || role,
              },
            }
          : undefined,
      },
      include: { employee: true },
    });

    // If role is DOCTOR, also create doctor record
    if (role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          departmentId: departmentId || null,
          specialization: designation || 'General Physician',
          consultationFee: 2000,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        details: JSON.stringify({ username, role }),
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user. Username or email may already exist.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMINISTRATOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, isActive, newPassword } = body;

    const data: any = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (newPassword) data.passwordHash = await hashPassword(newPassword);

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
