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
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        department: true,
        user: {
          include: {
            employee: true,
          },
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
