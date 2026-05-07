import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/ai";

export type PlanItem = {
  id: string;
  text: string;
  category: string | null;
  reason: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const mood: string = body.mood ?? "calm";

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tasks: true },
    });

    const pendingTasks = (user?.tasks ?? []).filter((t) => !t.completed);

    if (pendingTasks.length === 0) {
      return NextResponse.json({ plan: [], message: "No pending tasks — enjoy your day!" });
    }

    // Build task list for prompt
    const taskList = pendingTasks
      .map((t, i) => `${i + 1}. [${t.category ?? "Uncategorized"}] ${t.text} (id: ${t.id})`)
      .join("\n");

    const systemPrompt = `You are a productivity coach ordering a user's daily tasks.
Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
Each item must have: id (string), reason (string, max 8 words).
Order by: urgency, category variety, mood fit.
Include max 6 tasks.`;

    const userMessage = `User mood: ${mood}
Pending tasks:
${taskList}

Return a JSON array of task IDs in the recommended order, with a short reason for each. Example:
[{"id":"abc","reason":"Quick win to build momentum"},{"id":"xyz","reason":"Important work task while focused"}]`;

    const raw = await callClaude(systemPrompt, userMessage, 400);

    // Safe parse
    let orderedIds: { id: string; reason: string }[] = [];
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      orderedIds = JSON.parse(cleaned);
    } catch {
      // fallback: return tasks as-is
      orderedIds = pendingTasks.slice(0, 6).map((t) => ({ id: t.id, reason: "Recommended task" }));
    }

    // Hydrate with full task data
    const taskMap = new Map(pendingTasks.map((t) => [t.id, t]));
    const plan: PlanItem[] = orderedIds
      .filter((item) => taskMap.has(item.id))
      .map((item) => {
        const task = taskMap.get(item.id)!;
        return {
          id: task.id,
          text: task.text,
          category: task.category,
          reason: item.reason,
        };
      });

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("PLAN ERROR:", err);
    return NextResponse.json({ error: "Could not generate plan" }, { status: 500 });
  }
}