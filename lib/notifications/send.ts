import { prisma } from "@/lib/prisma";
import { pickTemplate } from "./templates";
import { NOTIFICATION_WINDOWS } from "./schedule";
import type { NotificationType } from "./types";

// Creates the 4 daily nudges for a user if they haven't been seeded yet today
export async function seedTodayNotifications(userId: string): Promise<void> {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const existing = await prisma.notification.count({
    where: { userId, scheduledAt: { gte: today, lt: tomorrow } },
  });
  if (existing > 0) return;

  const records = NOTIFICATION_WINDOWS.map((w) => {
    const { title, body } = pickTemplate(w.type as NotificationType, userId);
    const scheduledAt = new Date(today);
    scheduledAt.setHours(w.scheduledHour, 0, 0, 0);
    return { userId, title, body, type: w.type, scheduledAt };
  });

  await prisma.notification.createMany({ data: records });
}

// Returns today's unsent notification for a specific time window type
export async function getDueNotification(userId: string, type: string) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return prisma.notification.findFirst({
    where: {
      userId,
      type,
      sent: false,
      scheduledAt: { gte: today, lt: tomorrow },
    },
  });
}

export async function markSent(id: string): Promise<void> {
  await prisma.notification.update({ where: { id }, data: { sent: true } });
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
