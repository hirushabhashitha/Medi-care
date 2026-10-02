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
  const patientId = searchParams.get('patientId') || '';

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, phone: true } },
        items: true,
        payments: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, items = [], discount = 0, tax = 0, notes } = body;

    if (!patientId || items.length === 0) {
      return NextResponse.json({ error: 'Patient and at least one item are required' }, { status: 400 });
    }

    // Generate Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1),
      0
    );
    const grandTotal = Math.max(0, subtotal + Number(tax || 0) - Number(discount || 0));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        subtotal,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        grandTotal,
        status: 'PENDING',
        notes,
        items: {
          create: items.map((item: any) => ({
            itemType: item.itemType || 'OTHER',
            description: item.description,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.unitPrice || 0) * Number(item.quantity || 1),
            medicineId: item.medicineId || null,
          })),
        },
      },
      include: {
        items: true,
        patient: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Failed to generate invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
