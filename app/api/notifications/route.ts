import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedTodayNotifications, getDueNotification, markSent } from "@/lib/notifications/send";
import { isValidType } from "@/lib/notifications/schedule";

// GET /api/notifications?type=morning  — seed today + return due nudge for this window
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ notification: null });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  if (!isValidType(type)) return NextResponse.json({ notification: null });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ notification: null });

  await seedTodayNotifications(user.id);

  const notification = await getDueNotification(user.id, type);
  return NextResponse.json({ notification });
}

// PATCH /api/notifications  — mark a notification as sent
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  await markSent(id);
  return NextResponse.json({ ok: true });
}
