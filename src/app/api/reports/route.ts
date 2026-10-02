import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalPatients,
      totalAppointments,
      completedAppointments,
      totalRevenueData,
      invoices,
      totalMedicines,
      lowStockCount,
      totalLabOrders,
      completedLabOrders,
      totalBeds,
      occupiedBeds,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        select: { status: true, grandTotal: true, invoiceDate: true },
      }),
      prisma.medicine.count({ where: { isActive: true } }),
      prisma.medicine.count({
        where: { isActive: true, stockQty: { lte: 10 } },
      }),
      prisma.labOrder.count(),
      prisma.labOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.bed.count({ where: { isActive: true } }),
      prisma.bed.count({ where: { isActive: true, isOccupied: true } }),
    ]);

    const totalRevenue = totalRevenueData._sum.amount || 0;
    const pendingBilling = invoices
      .filter((inv) => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return NextResponse.json({
      totalPatients,
      totalAppointments,
      completedAppointments,
      totalRevenue,
      pendingBilling,
      totalMedicines,
      lowStockCount,
      totalLabOrders,
      completedLabOrders,
      totalBeds,
      occupiedBeds,
      occupancyRate,
    });
  } catch (error) {
    console.error('Failed to generate reports:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
