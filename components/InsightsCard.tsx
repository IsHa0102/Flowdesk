"use client";

import type { InsightData } from "@/lib/insights";

const categoryColors: Record<string, string> = {
  Personal: "bg-violet-100 text-violet-700",
  Work: "bg-blue-100 text-blue-700",
  Health: "bg-emerald-100 text-emerald-700",
  Study: "bg-amber-100 text-amber-700",
  Uncategorized: "bg-gray-100 text-gray-500",
};

export default function InsightsCard({ data }: { data: InsightData }) {
  const { total, completed, completionPct, topCategory, categoryCounts, focusMessage, nudge } = data;

  // Ring arc calculation for the donut
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Insights
        </h2>
        {nudge && (
          <span className="text-xs text-gray-400 italic">{nudge}</span>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Add your first task to see insights here.
        </p>
      ) : (
        <>
          {/* Stats row */}
          <div className="flex items-center gap-6">
            {/* Donut ring */}
            <div className="relative flex-shrink-0 w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                {/* Track */}
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="7"
                />
                {/* Progress */}
                <circle
                  cx="36" cy="36" r={radius}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
                {completionPct}%
              </span>
            </div>

            {/* Numbers */}
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{completed}</p>
                <p className="text-xs text-gray-400 mt-0.5">Done</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{total - completed}</p>
                <p className="text-xs text-gray-400 mt-0.5">Pending</p>
              </div>
            </div>
          </div>

          {/* Focus message */}
          {focusMessage && (
            <p className="text-sm text-gray-500">{focusMessage}</p>
          )}

          {/* Category breakdown bars */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="space-y-2 pt-1">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => {
                  const pct = Math.round((count / total) * 100);
                  const colorClass =
                    categoryColors[cat] ?? "bg-gray-100 text-gray-500";
                  const barColor =
                    cat === "Work" ? "bg-blue-400"
                    : cat === "Health" ? "bg-emerald-400"
                    : cat === "Study" ? "bg-amber-400"
                    : cat === "Personal" ? "bg-violet-400"
                    : "bg-gray-300";

                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center flex-shrink-0 ${colorClass}`}>
                        {cat}
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
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