import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tests = await prisma.labTest.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Failed to fetch lab tests:', error);
    return NextResponse.json({ error: 'Failed to fetch lab tests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, normalRange, unit, price, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Test name is required' }, { status: 400 });
    }

    const test = await prisma.labTest.create({
      data: {
        name,
        category,
        normalRange,
        unit,
        price: Number(price) || 0,
        description,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Failed to create lab test:', error);
    return NextResponse.json({ error: 'Failed to create lab test' }, { status: 500 });
  }
}
