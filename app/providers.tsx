"use client";

import { SessionProvider } from "next-auth/react";
import { MoodProvider } from "@/context/MoodContext";
import NotificationManager from "@/components/NotificationManager";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MoodProvider>
        <NotificationManager />
        {children}
      </MoodProvider>
    </SessionProvider>
  );
}
