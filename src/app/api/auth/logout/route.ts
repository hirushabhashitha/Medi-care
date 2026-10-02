import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'LOGOUT',
          entity: 'User',
          entityId: session.userId,
          details: JSON.stringify({ username: session.username }),
        },
      });
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
