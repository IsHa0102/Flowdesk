"use client";

import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import NudgeToast from "@/components/NudgeToast";

export default function NotificationManager() {
  const { nudge, dismiss } = useNotifications();

  return (
    <AnimatePresence>
      {nudge && (
        <NudgeToast
          key={nudge.id}
          title={nudge.title}
          body={nudge.body}
          onDismiss={dismiss}
        />
      )}
    </AnimatePresence>
  );
}
