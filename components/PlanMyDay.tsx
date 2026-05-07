"use client";

import { useState } from "react";

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

export default function PlanMyDay({ mood }: { mood: string }) {
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
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black active:scale-95 transition-all duration-150"
      >
        ✦ Plan My Day
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center px-4 pb-4 md:pb-0"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Today's Plan</h2>
                <p className="text-xs text-gray-400 mt-0.5">AI-ordered for your {mood} mood</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                  <span className="text-sm">Building your plan...</span>
                </div>
              )}

              {!loading && message && (
                <p className="text-sm text-gray-500 text-center py-6">{message}</p>
              )}

              {!loading &&
                plan.map((item, i) => {
                  const colorClass =
                    categoryColors[item.category ?? ""] ?? "bg-gray-100 text-gray-500";
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      {/* Step number */}
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm text-gray-800 leading-snug">{item.text}</p>
                        <div className="flex items-center gap-2">
                          {item.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                              {item.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 italic">{item.reason}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            {!loading && plan.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={generate}
                  className="text-xs text-gray-400 hover:text-gray-700 transition"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-black transition"
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