import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || '';
  const doctorId = searchParams.get('doctorId') || '';

  try {
    const records = await prisma.medicalRecord.findMany({
      where: {
        ...(patientId ? { patientId } : {}),
        ...(doctorId ? { doctorId } : {}),
      },
      include: {
        patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, bloodGroup: true, dateOfBirth: true } },
        doctor: {
          include: {
            user: { include: { employee: { select: { firstName: true, lastName: true } } } },
          },
        },
        prescriptions: {
          include: { items: true },
        },
      },
      orderBy: { visitDate: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
    return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      appointmentId,
      bloodPressure,
      pulse,
      temperature,
      weight,
      height,
      spO2,
      symptoms,
      diagnosis,
      diagnosisCode,
      treatmentNotes,
      prescriptions = [], // array of { medicineId, medicineName, dosage, frequency, duration, instructions, quantity }
      labTests = [], // array of labTestId strings
    } = body;

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: 'Patient ID and Doctor ID are required' }, { status: 400 });
    }

    // 1. Create Medical Record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId,
        appointmentId,
        bloodPressure,
        pulse: pulse ? Number(pulse) : null,
        temperature: temperature ? Number(temperature) : null,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        spO2: spO2 ? Number(spO2) : null,
        symptoms,
        diagnosis,
        diagnosisCode,
        treatmentNotes,
      },
    });

    // 2. Create Prescription if provided
    if (prescriptions.length > 0) {
      await prisma.prescription.create({
        data: {
          medicalRecordId: medicalRecord.id,
          items: {
            create: prescriptions.map((p: any) => ({
              medicineId: p.medicineId || null,
              medicineName: p.medicineName || 'Medication',
              dosage: p.dosage || '',
              frequency: p.frequency || '',
              duration: p.duration || '',
              instructions: p.instructions || '',
              quantity: Number(p.quantity) || 1,
            })),
          },
        },
      });
    }

    // 3. Create Lab Order if lab tests were requested
    if (labTests.length > 0) {
      await prisma.labOrder.create({
        data: {
          patientId,
          orderedBy: session.username,
          items: {
            create: labTests.map((testId: string) => ({
              labTestId: testId,
              status: 'PENDING',
            })),
          },
        },
      });
    }

    // 4. Update appointment status to COMPLETED if linked
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      }).catch(() => {});
    }

    return NextResponse.json(medicalRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create medical record:', error);
    return NextResponse.json({ error: 'Failed to record consultation' }, { status: 500 });
  }
}
