import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId') || '';

  try {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: true,
        user: { select: { id: true, username: true, email: true, role: true, isActive: true } },
      },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
