import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/ai";

const VALID_CATEGORIES = ["Personal", "Work", "Health", "Study"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

async function inferCategory(text: string): Promise<Category> {
  try {
    const result = await callClaude(
      `You are a task categorizer. Given a task, respond with ONLY one word — the best category from this list: Personal, Work, Health, Study. No punctuation, no explanation.`,
      text,
      10
    );
    const trimmed = result.trim() as Category;
    return VALID_CATEGORIES.includes(trimmed) ? trimmed : "Personal";
  } catch {
    return "Personal";
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json([]);

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET TASK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body?.text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? "",
        },
      });
    }

    const category: Category =
      body.category && VALID_CATEGORIES.includes(body.category)
        ? body.category
        : await inferCategory(body.text);

    // ✅ Parse dueDate if provided
    let dueDate: Date | null = null;
    if (body.dueDate) {
      const parsed = new Date(body.dueDate);
      if (!isNaN(parsed.getTime())) dueDate = parsed;
    }

    const task = await prisma.task.create({
      data: {
        text: body.text,
        completed: false,
        category,
        dueDate,        // ✅ NEW
        userId: user.id,
      },
    });

    return NextResponse.json({ ...task, aiCategorized: !body.category });
  } catch (err) {
    console.error("POST TASK ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // ✅ Build update data dynamically — supports both toggle AND reschedule
    const data: Record<string, unknown> = {};

    if (typeof body.completed === "boolean") {
      data.completed = body.completed;
    }

    if ("dueDate" in body) {
      if (!body.dueDate) {
        data.dueDate = null;
      } else {
        const parsed = new Date(body.dueDate);
        if (!isNaN(parsed.getTime())) data.dueDate = parsed;
      }
    }

    const updated = await prisma.task.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH TASK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await prisma.task.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch (err) {