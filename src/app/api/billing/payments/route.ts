import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { invoiceId, amount, paymentMethod = 'CASH', notes } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: 'Invoice and amount are required' }, { status: 400 });
    }

    const payCount = await prisma.payment.count();
    const receiptNumber = `RCP-${String(payCount + 1).padStart(5, '0')}`;

    // 1. Create Payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: Number(amount),
        paymentMethod,
        receiptNumber,
        notes,
      },
    });

    // 2. Calculate total paid for invoice
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (invoice) {
      const isFull = totalPaid >= invoice.grandTotal;
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: isFull ? 'PAID' : 'PARTIALLY_PAID',
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Failed to record payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
