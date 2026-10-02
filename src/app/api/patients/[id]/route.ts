import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  include: {
                    employee: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          include: {
            prescriptions: {
              include: { items: true },
            },
            doctor: {
              include: {
                user: {
                  include: {
                    employee: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
        admissions: {
          orderBy: { admissionDate: 'desc' },
          include: {
            bed: { include: { ward: true } },
          },
        },
        labOrders: {
          orderBy: { orderDate: 'desc' },
          include: {
            items: { include: { labTest: true } },
          },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          include: {
            payments: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Failed to fetch patient details:', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { firstName, lastName, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, allergies, notes } = body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
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

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Failed to update patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
