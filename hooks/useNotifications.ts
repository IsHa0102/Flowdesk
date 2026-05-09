"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getCurrentWindow } from "@/lib/notifications/schedule";

export interface Nudge {
  id: string;
  title: string;
  body: string;
  type: string;
}

export function useNotifications() {
  const { status } = useSession();
  const [nudge, setNudge] = useState<Nudge | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    async function check() {
      try {
        const hourNow = new Date().getHours();
        const window = getCurrentWindow(hourNow);
        if (!window) return;

        const res = await fetch(`/api/notifications?type=${window.type}`);
        if (!res.ok || cancelled) return;

        const { notification } = await res.json();
        if (!notification || cancelled) return;

        // Mark as sent immediately so repeat page loads in the same window stay quiet
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notification.id }),
        });

        if (!cancelled) setNudge(notification);

        // Offer browser notification if the user already granted permission
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(notification.title, { body: notification.body });
        }
      } catch {
        // Notifications are non-critical — swallow errors silently
      }
    }

    // Brief delay so the UI settles before the nudge appears
    const timer = setTimeout(check, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status]);

  return {
    nudge,
    dismiss: () => setNudge(null),
  };
}
