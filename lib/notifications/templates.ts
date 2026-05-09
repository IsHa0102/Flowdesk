import type { NotificationType, NotificationTemplate } from "./types";

const POOL: Record<NotificationType, NotificationTemplate[]> = {
  morning: [
    {
      title: "Good morning ✨",
      body: "What would make today feel meaningful, not just productive?",
    },
    {
      title: "A calm start",
      body: "creates better momentum than rushing ever does.",
    },
  ],
  midday: [
    {
      title: "Quick check-in 🌿",
      body: "Have you had water and a real pause yet?",
    },
    {
      title: "Small resets",
      body: "Momentum grows better with small resets than nonstop pressure.",
    },
  ],
  evening: [
    {
      title: "End of day",
      body: "Your day doesn't need to be perfect to be worthwhile. Want to reflect for a minute?",
    },
    {
      title: "Tiny progress",
      body: "still changes the future version of you.",
    },
  ],
  night: [
    {
      title: "Before the day ends…",
      body: "What's one thing you handled better than yesterday?",
    },
    {
      title: "Rest is part of growth too.",
      body: "You've done enough for today.",
    },
  ],
};

// Deterministic daily rotation so the message varies each day without being random
export function pickTemplate(type: NotificationType, userId: string): NotificationTemplate {
  const pool = POOL[type];
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const userHash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[(dayIndex + userHash) % pool.length];
}
