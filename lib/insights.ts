// lib/insights.ts
// Pure client-side computation — no API calls, no AI.
// Takes the task array and returns structured insight data.

export type InsightData = {
  total: number;
  completed: number;
  pending: number;
  completionPct: number;
  topCategory: string | null;
  categoryCounts: Record<string, number>;
  focusMessage: string;
  nudge: string;
};

export function computeInsights(
  tasks: { completed: boolean; category?: string | null }[]
): InsightData {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Category frequency
  const categoryCounts = tasks.reduce<Record<string, number>>((acc, t) => {
    const c = t.category ?? "Uncategorized";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const topCategory =
    Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // Focus message — purely descriptive
  let focusMessage = "";
  if (total === 0) {
    focusMessage = "No tasks yet today";
  } else if (topCategory) {
    const share = Math.round((categoryCounts[topCategory] / total) * 100);
    if (share >= 60) {
      focusMessage = `You're focused heavily on ${topCategory} tasks`;
    } else {
      focusMessage = `You're balancing across categories`;
    }
  }

  // Nudge — condition-based, no AI
  let nudge = "";
  if (total === 0) {
    nudge = "Add a task to get started";
  } else if (completionPct === 100) {
    nudge = "Everything done — outstanding work today";
  } else if (completionPct >= 70) {
    nudge = "Great progress — you're almost there";
  } else if (completionPct >= 40) {
    nudge = "Good momentum — keep going";
  } else if (pending >= 5) {
    nudge = "Start with one small task to build momentum";
  } else {
    nudge = "You've got this — one step at a time";
  }

  return {
    total,
    completed,
    pending,
    completionPct,
    topCategory,
    categoryCounts,
    focusMessage,
    nudge,
  };
}

// Light in-memory "memory" — stores recent category usage
// Used to enrich reflection context sent to the API
export type MemorySummary = {
  recentCategories: string[];        // last 5 task categories
  dominantCategory: string | null;   // most frequent overall
  streakDays: number;                // placeholder for future streak logic
};

export function buildMemorySummary(
  tasks: { category?: string | null; completed: boolean }[]
): MemorySummary {
  const recentCategories = tasks
    .slice(0, 5)
    .map((t) => t.category ?? "Uncategorized");

  const counts = tasks.reduce<Record<string, number>>((acc, t) => {
    const c = t.category ?? "Uncategorized";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const dominantCategory =
    Object.keys(counts).length > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return {
    recentCategories,
    dominantCategory,
    streakDays: 0,
  };
}