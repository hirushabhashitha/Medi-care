import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch dashboard statistics
  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    totalMedicines,
    lowStockMedicines,
    pendingLabOrders,
    pendingInvoices,
    totalEmployees,
    totalAdmissions,
    recentPatients,
    recentAppointments,
  ] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.medicine.count({ where: { isActive: true } }),
    prisma.medicine.count({
      where: {
        isActive: true,
        stockQty: { lte: prisma.medicine.fields.reorderLevel ? 10 : 10 },
      },
    }).catch(() => 0),
    prisma.labOrder.count({ where: { status: 'PENDING' } }),
    prisma.invoice.count({ where: { status: 'PENDING' } }),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.admission.count({ where: { status: 'ADMITTED' } }),
    prisma.patient.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        patientCode: true,
        firstName: true,
        lastName: true,
        gender: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { firstName: true, lastName: true, patientCode: true } },
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
    }),
  ]);

  const stats = {
    totalPatients,
    totalDoctors,
    todayAppointments,
    totalMedicines,
    lowStockMedicines,
    pendingLabOrders,
    pendingInvoices,
    totalEmployees,
    totalAdmissions,
  };

  const serializedAppointments = recentAppointments.map((apt) => ({
    id: apt.id,
    date: apt.date.toISOString(),
    timeSlot: apt.timeSlot,
    status: apt.status,
    patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
    patientCode: apt.patient.patientCode,
    doctorName: apt.doctor.user.employee
      ? `Dr. ${apt.doctor.user.employee.firstName} ${apt.doctor.user.employee.lastName}`
      : 'Unknown',
  }));

  const serializedPatients = recentPatients.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      role={session.role}
      employeeName={session.employeeName || session.username}
      stats={stats}
      recentPatients={serializedPatients}
      recentAppointments={serializedAppointments}
    />
  );
}
