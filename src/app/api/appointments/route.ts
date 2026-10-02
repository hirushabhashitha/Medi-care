import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId') || '';
  const patientId = searchParams.get('patientId') || '';
  const status = searchParams.get('status') || '';
  const dateStr = searchParams.get('date') || '';

  try {
    let dateFilter = {};
    if (dateStr) {
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
      dateFilter = { date: { gte: start, lte: end } };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(doctorId ? { doctorId } : {}),
        ...(patientId ? { patientId } : {}),
        ...(status ? { status } : {}),
        ...dateFilter,
      },
      include: {
        patient: {
          select: { id: true, patientCode: true, firstName: true, lastName: true, phone: true, gender: true },
        },
        doctor: {
          include: {
            department: true,
            user: {
              include: { employee: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, doctorId, date, timeSlot, reason, notes } = body;

    if (!patientId || !doctorId || !date || !timeSlot) {
      return NextResponse.json({ error: 'Patient, doctor, date and time slot are required' }, { status: 400 });
    }

    const apptDate = new Date(date);
    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate token number for doctor on that date
    const count = await prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });
    const tokenNumber = count + 1;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: apptDate,
        timeSlot,
        tokenNumber,
        status: 'SCHEDULED',
        reason,
        notes,
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { include: { employee: true } },
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
  }
}
