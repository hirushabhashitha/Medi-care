import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wards = await prisma.ward.findMany({
      where: { isActive: true },
      include: {
        beds: {
          where: { isActive: true },
          include: {
            admissions: {
              where: { status: 'ADMITTED' },
              include: {
                patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, gender: true } },
                doctor: {
                  include: {
                    user: { include: { employee: { select: { firstName: true, lastName: true } } } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(wards);
  } catch (error) {
    console.error('Failed to fetch wards:', error);
    return NextResponse.json({ error: 'Failed to fetch wards' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, floor, initialBeds = 5, dailyRate = 1500 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Ward name is required' }, { status: 400 });
    }

    const ward = await prisma.ward.create({
      data: {
        name,
        type,
        floor,
        totalBeds: Number(initialBeds) || 0,
      },
    });

    // Create beds for this ward
    const bedCount = Number(initialBeds) || 0;
    if (bedCount > 0) {
      const prefix = name.substring(0, 3).toUpperCase();
      for (let i = 1; i <= bedCount; i++) {
        await prisma.bed.create({
          data: {
            wardId: ward.id,
            bedNumber: `${prefix}-${String(i).padStart(2, '0')}`,
            dailyRate: Number(dailyRate) || 1000,
            isOccupied: false,
          },
        });
      }
    }

    return NextResponse.json(ward, { status: 201 });
  } catch (error) {
    console.error('Failed to create ward:', error);
    return NextResponse.json({ error: 'Failed to create ward' }, { status: 500 });
  }
}
