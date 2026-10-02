import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const bloodGroup = searchParams.get('bloodGroup') || '';
  const gender = searchParams.get('gender') || '';

  try {
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        AND: [
          query
            ? {
                OR: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { patientCode: { contains: query } },
                  { phone: { contains: query } },
                  { email: { contains: query } },
                ],
              }
            : {},
          bloodGroup ? { bloodGroup } : {},
          gender ? { gender } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          take: 1,
          orderBy: { date: 'desc' },
          select: { date: true, status: true },
        },
        admissions: {
          where: { status: 'ADMITTED' },
          select: { id: true, bed: { select: { bedNumber: true, ward: { select: { name: true } } } } },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, allergies, notes } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Generate unique Patient Code (MRN)
    const count = await prisma.patient.count();
    const patientCode = `PAT-${String(count + 1).padStart(5, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        patientCode,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        bloodGroup,
        phone,
        email,
        address,
        emergencyContact,
        allergies,
        notes,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'Patient',
        entityId: patient.id,
        details: JSON.stringify({ patientCode, name: `${firstName} ${lastName}` }),
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Failed to create patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
