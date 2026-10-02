import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  try {
    const admissions = await prisma.admission.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { include: { employee: { select: { firstName: true, lastName: true } } } },
          },
        },
        bed: {
          include: { ward: true },
        },
      },
      orderBy: { admissionDate: 'desc' },
    });

    return NextResponse.json(admissions);
  } catch (error) {
    console.error('Failed to fetch admissions:', error);
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, doctorId, bedId, diagnosis, notes } = body;

    if (!patientId || !doctorId || !bedId) {
      return NextResponse.json({ error: 'Patient, doctor, and bed are required' }, { status: 400 });
    }

    // 1. Create admission
    const admission = await prisma.admission.create({
      data: {
        patientId,
        doctorId,
        bedId,
        diagnosis,
        notes,
        status: 'ADMITTED',
      },
    });

    // 2. Mark bed as occupied
    await prisma.bed.update({
      where: { id: bedId },
      data: { isOccupied: true },
    });

    return NextResponse.json(admission, { status: 201 });
  } catch (error) {
    console.error('Failed to admit patient:', error);
    return NextResponse.json({ error: 'Failed to admit patient' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, bedId, dischargeNotes } = body;

    // 1. Update admission to DISCHARGED
    const admission = await prisma.admission.update({
      where: { id },
      data: {
        status: 'DISCHARGED',
        dischargeDate: new Date(),
        notes: dischargeNotes || undefined,
      },
    });

    // 2. Free up the bed
    if (bedId) {
      await prisma.bed.update({
        where: { id: bedId },
        data: { isOccupied: false },
      });
    }

    return NextResponse.json(admission);
  } catch (error) {
    console.error('Failed to discharge patient:', error);
    return NextResponse.json({ error: 'Failed to discharge patient' }, { status: 500 });
  }
}
