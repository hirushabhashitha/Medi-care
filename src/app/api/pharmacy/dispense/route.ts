import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        items: {
          some: { isDispensed: false },
        },
      },
      include: {
        items: {
          include: { medicine: true },
        },
        medicalRecord: {
          include: {
            patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, phone: true } },
            doctor: {
              include: {
                user: { include: { employee: { select: { firstName: true, lastName: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prescriptionItemId, medicineId, quantity } = body;

    // 1. Mark prescription item as dispensed
    await prisma.prescriptionItem.update({
      where: { id: prescriptionItemId },
      data: { isDispensed: true },
    });

    // 2. Decrement medicine inventory if medicineId is linked
    if (medicineId) {
      await prisma.medicine.update({
        where: { id: medicineId },
        data: {
          stockQty: { decrement: Number(quantity) || 1 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to dispense item:', error);
    return NextResponse.json({ error: 'Failed to dispense medication' }, { status: 500 });
  }
}
