import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ manifestation: null });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ manifestation: null });

  const manifestation = await prisma.manifestation.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ manifestation });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { affirmations, goalImageUrl, scripting } = body;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const manifestation = await prisma.manifestation.upsert({
    where: { userId: user.id },
    update: { affirmations, goalImageUrl, scripting },
    create: { userId: user.id, affirmations, goalImageUrl, scripting },
  });

  return NextResponse.json({ manifestation });
}
