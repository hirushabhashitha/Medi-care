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
    const orders = await prisma.labOrder.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { id: true, patientCode: true, firstName: true, lastName: true, gender: true, phone: true } },
        items: {
          include: {
            labTest: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch lab orders:', error);
    return NextResponse.json({ error: 'Failed to fetch lab orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, testIds = [], notes } = body;

    if (!patientId || testIds.length === 0) {
      return NextResponse.json({ error: 'Patient and tests are required' }, { status: 400 });
    }

    const order = await prisma.labOrder.create({
      data: {
        patientId,
        orderedBy: session.username,
        notes,
        status: 'PENDING',
        items: {
          create: testIds.map((testId: string) => ({
            labTestId: testId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        items: { include: { labTest: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create lab order:', error);
    return NextResponse.json({ error: 'Failed to create lab order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itemId, result, remarks, status, orderId } = body;

    // Update single item result
    if (itemId) {
      const updatedItem = await prisma.labOrderItem.update({
        where: { id: itemId },
        data: {
          result,
          remarks,
          status: status || 'COMPLETED',
          resultDate: new Date(),
        },
      });

      // If all items in the order are completed, mark the order as COMPLETED
      if (orderId) {
        const remaining = await prisma.labOrderItem.count({
          where: { labOrderId: orderId, status: { not: 'COMPLETED' } },
        });
        if (remaining === 0) {
          await prisma.labOrder.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      return NextResponse.json(updatedItem);
    }

    // Or update order overall status
    if (orderId && status) {
      const order = await prisma.labOrder.update({
        where: { id: orderId },
        data: { status },
      });
      return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update lab order item:', error);
    return NextResponse.json({ error: 'Failed to update lab results' }, { status: 500 });
  }
}
