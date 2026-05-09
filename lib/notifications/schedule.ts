import type { NotificationWindow, NotificationType } from "./types";

export const NOTIFICATION_WINDOWS: NotificationWindow[] = [
  { type: "morning",  scheduledHour: 8,  displayStart: 7,  displayEnd: 11 },
  { type: "midday",   scheduledHour: 13, displayStart: 12, displayEnd: 15 },
  { type: "evening",  scheduledHour: 19, displayStart: 18, displayEnd: 21 },
  { type: "night",    scheduledHour: 22, displayStart: 21, displayEnd: 24 },
];

// Returns the window active at the given local hour, or null if between windows
export function getCurrentWindow(hourNow: number): NotificationWindow | null {
  return (
    NOTIFICATION_WINDOWS.find(
      (w) => hourNow >= w.displayStart && hourNow < w.displayEnd
    ) ?? null
  );
}

export function isValidType(type: string): type is NotificationType {
  return ["morning", "midday", "evening", "night"].includes(type);
}
