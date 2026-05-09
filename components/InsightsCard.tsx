"use client";

import type { InsightData } from "@/lib/insights";

const categoryColors: Record<string, string> = {
  Personal: "bg-violet-100 text-violet-700",
  Work: "bg-blue-100 text-blue-700",
  Health: "bg-emerald-100 text-emerald-700",
  Study: "bg-amber-100 text-amber-700",
  Uncategorized: "bg-stone-100 text-stone-500",
};

export default function InsightsCard({ data }: { data: InsightData }) {
  const { total, completed, completionPct, categoryCounts, focusMessage, nudge } = data;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
          Insights
        </h2>
        {nudge && (
          <span className="text-xs text-[var(--text-secondary)] italic">{nudge}</span>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] text-center py-4">
          Add your first task to see insights here.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0 w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none"
                  stroke="var(--border-soft)"
                  strokeWidth="7"
                />
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[var(--text-primary)]">
                {completionPct}%
              </span>
            </div>

            <div className="flex gap-6">
              {[
                { value: total, label: "Total" },
                { value: completed, label: "Done" },
                { value: total - completed, label: "Pending" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-semibold text-[var(--heading-color)]">{value}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {focusMessage && (
            <p className="text-sm text-[var(--text-secondary)]">{focusMessage}</p>
          )}

          {Object.keys(categoryCounts).length > 0 && (
            <div className="space-y-2 pt-1">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => {
                  const pct = Math.round((count / total) * 100);
                  const colorClass = categoryColors[cat] ?? "bg-stone-100 text-stone-500";
                  const barColor =
                    cat === "Work"     ? "bg-blue-400"
                    : cat === "Health"  ? "bg-emerald-400"
                    : cat === "Study"   ? "bg-amber-400"
                    : cat === "Personal" ? "bg-violet-400"
                    : "bg-stone-400";

                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center flex-shrink-0 ${colorClass}`}>
                        {cat}
                      </span>
                      <div className="flex-1 h-1.5 bg-[var(--border-soft)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] w-6 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
