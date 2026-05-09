export type NotificationType = "morning" | "midday" | "evening" | "night";

export interface NotificationWindow {
  type: NotificationType;
  scheduledHour: number;
  displayStart: number;
  displayEnd: number;
}

export interface NotificationTemplate {
  title: string;
  body: string;
}
