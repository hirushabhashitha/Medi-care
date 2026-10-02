import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const filterLowStock = searchParams.get('lowStock') === 'true';

  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { genericName: { contains: q } },
                  { brand: { contains: q } },
                  { batchNumber: { contains: q } },
                ],
              }
            : {},
          category ? { category } : {},
        ],
      },
      orderBy: { name: 'asc' },
    });

    const filtered = filterLowStock
      ? medicines.filter((m) => m.stockQty <= m.reorderLevel)
      : medicines;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, genericName, brand, category, batchNumber, unitCost, sellingPrice, stockQty, reorderLevel, expiryDate, manufacturer, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        brand,
        category,
        batchNumber,
        unitCost: Number(unitCost) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        stockQty: Number(stockQty) || 0,
        reorderLevel: Number(reorderLevel) || 10,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        manufacturer,
        description,
      },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error('Failed to create medicine:', error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, stockQty, sellingPrice, unitCost, reorderLevel } = body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...(stockQty !== undefined ? { stockQty: Number(stockQty) } : {}),
        ...(sellingPrice !== undefined ? { sellingPrice: Number(sellingPrice) } : {}),
        ...(unitCost !== undefined ? { unitCost: Number(unitCost) } : {}),
        ...(reorderLevel !== undefined ? { reorderLevel: Number(reorderLevel) } : {}),
      },
    });

    return NextResponse.json(medicine);
  } catch (error) {
    console.error('Failed to update stock:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}
