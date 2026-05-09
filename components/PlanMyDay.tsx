"use client";

import { useState } from "react";
import { useMood } from "@/context/MoodContext";

type PlanItem = {
  id: string;
  text: string;
  category: string | null;
  reason: string;
};

const categoryColors: Record<string, string> = {
  Personal: "bg-violet-100 text-violet-700",
  Work: "bg-blue-100 text-blue-700",
  Health: "bg-emerald-100 text-emerald-700",
  Study: "bg-amber-100 text-amber-700",
};

export default function PlanMyDay() {
  const { mood } = useMood();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setPlan([]);
    setMessage("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      setPlan(data.plan ?? []);
      setMessage(data.message ?? "");
    } catch {
      setMessage("Could not generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    generate();
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium active:scale-95 transition-all duration-150"
        style={{ background: "var(--accent)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
      >
        ✦ Plan My Day
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center px-4 pb-4 md:pb-0"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-[var(--border-soft)] rounded-2xl shadow-xl overflow-hidden"
            style={{ background: "var(--card-bg)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-soft)]">
              <div>
                <h2 className="font-semibold text-[var(--heading-color)] text-sm">Today&apos;s Plan</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">AI-ordered for your {mood} mood</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--muted-text)] hover:text-[var(--heading-color)] transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 gap-3 text-[var(--text-secondary)]">
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--accent-soft)", borderTopColor: "var(--accent)" }}
                  />
                  <span className="text-sm">Building your plan...</span>
                </div>
              )}

              {!loading && message && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-6">{message}</p>
              )}

              {!loading &&
                plan.map((item, i) => {
                  const colorClass = categoryColors[item.category ?? ""] ?? "bg-stone-100 text-stone-500";
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-soft)]"
                      style={{ background: "var(--bg-primary)" }}
                    >
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center mt-0.5 text-[var(--chip-text)]"
                        style={{ background: "var(--accent-soft)" }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm text-[var(--text-primary)] leading-snug">{item.text}</p>
                        <div className="flex items-center gap-2">
                          {item.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                              {item.category}
                            </span>
                          )}
                          <span className="text-xs text-[var(--muted-text)] italic">{item.reason}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            {!loading && plan.length > 0 && (
              <div className="px-6 py-4 border-t border-[var(--border-soft)] flex justify-between items-center">
                <button
                  onClick={generate}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--heading-color)] transition"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-white text-xs font-medium transition"
                  style={{ background: "var(--accent)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
