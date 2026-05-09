import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ entry: null });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ entry: null });

  const entry = await prisma.dailyHealth.findUnique({
    where: { userId_date: { userId: user.id, date: todayUTC() } },
  });

  return NextResponse.json({ entry });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { waterGlasses, sleepHours, movementLevel } = body;
  const today = todayUTC();

  const entry = await prisma.dailyHealth.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {
      ...(waterGlasses !== undefined && { waterGlasses }),
      ...(sleepHours !== undefined && { sleepHours }),
      ...(movementLevel !== undefined && { movementLevel }),
    },
    create: {
      userId: user.id,
      date: today,
      waterGlasses: waterGlasses ?? 0,
      sleepHours: sleepHours ?? null,
      movementLevel: movementLevel ?? null,
    },
  });

  return NextResponse.json({ entry });
}
