import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const mood: string = body.mood ?? "calm";

    // Lightweight memory context passed from client — no schema changes needed
    const clientMemory = body.memory ?? null;

    let taskContext = "";
    let memoryContext = "";
    let journalContext = "";

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { tasks: true },
      });

      if (user) {
        const latestEntry = await prisma.dailyEntry.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });

        if (latestEntry) {
          const gratitudeList = latestEntry.gratitude.filter(Boolean).join(", ");
          journalContext = `Journal check-in:
- Mood: ${latestEntry.mood}
- Grateful for: ${gratitudeList || "—"}
- Win of the day: ${latestEntry.win || "—"}`;
        }
      }

      if (user?.tasks?.length) {
        const total = user.tasks.length;
        const completed = user.tasks.filter((t) => t.completed).length;
        const pending = total - completed;
        const completionPct = Math.round((completed / total) * 100);

        const catCounts = user.tasks.reduce<Record<string, number>>((acc, t) => {
          const c = t.category ?? "Uncategorized";
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {});

        const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
        const topCategory = sorted[0]?.[0];
        const topShare = total > 0 ? Math.round(((sorted[0]?.[1] ?? 0) / total) * 100) : 0;
        const categoryLine = sorted.map(([k, v]) => `${k}: ${v}`).join(", ");

        taskContext = `Task snapshot:
- ${total} total, ${completed} completed (${completionPct}%), ${pending} pending
- Top category: ${topCategory} (${topShare}% of tasks)
- Breakdown: ${categoryLine}`;

        if (clientMemory?.recentCategories || clientMemory?.dominantCategory) {
          memoryContext = `Behavioral context:
- Recently worked on: ${clientMemory.recentCategories?.join(", ") ?? "various tasks"}
- Dominant focus: ${clientMemory.dominantCategory ?? topCategory}`;
        }
      }
    }

    const systemPrompt = `You are a calm, insightful productivity coach. Write a daily reflection for a user.
Rules:
- Max 2-3 sentences only
- Be specific to their data — don't be generic or vague
- Reference their category focus or completion rate naturally when relevant
- Tone by mood: calm=gentle and steady, focused=crisp and direct, stressed=reassuring and grounding, motivated=energizing and affirming
- No bullet points, no markdown, no headers
- Sound like a thoughtful human, not an AI`;

    const userMessage = `Mood: ${mood}

${taskContext || "No tasks added yet."}${memoryContext ? "\n\n" + memoryContext : ""}${journalContext ? "\n\n" + journalContext : ""}

Write their reflection now.`;

    const reflection = await callClaude(systemPrompt, userMessage, 150);

    return NextResponse.json({ reflection: reflection.trim() });
  } catch (err) {
    console.error("REFLECTION ERROR:", err);
    return NextResponse.json({
      reflection: "Take it one step at a time — you're doing fine.",
    });
  }
}