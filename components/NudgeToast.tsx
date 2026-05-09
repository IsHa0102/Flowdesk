"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NudgeToastProps {
  title: string;
  body: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function NudgeToast({
  title,
  body,
  onDismiss,
  autoDismissMs = 9000,
}: NudgeToastProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);

    // Animate the progress bar with CSS animation for butter-smooth rendering
    if (barRef.current) {
      barRef.current.style.transition = `width ${autoDismissMs}ms linear`;
      // Force reflow then start the animation
      void barRef.current.offsetWidth;
      barRef.current.style.width = "0%";
    }

    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4"
    >
      <div
        className="rounded-2xl border border-[var(--border-soft)] shadow-lg relative overflow-hidden"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="px-4 pt-4 pb-3.5 flex items-start justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--heading-color)] leading-snug">{title}</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{body}</p>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[var(--muted-text)] hover:text-[var(--text-secondary)] transition-colors duration-150"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div
          ref={barRef}
          className="absolute bottom-0 left-0 h-0.5"
          style={{ width: "100%", background: "var(--accent-soft)" }}
        />
      </div>
    </motion.div>
  );
}
