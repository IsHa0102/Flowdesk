"use client";

import { useState } from "react";

const CATEGORIES = ["Personal", "Work", "Health", "Study"];

const categoryActiveClasses: Record<string, string> = {
  Personal: "bg-violet-100 text-violet-700 border border-violet-200",
  Work:     "bg-blue-100 text-blue-700 border border-blue-200",
  Health:   "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Study:    "bg-amber-100 text-amber-700 border border-amber-200",
};

export default function TaskInput({
  onAdd,
}: {
  onAdd: (text: string, category: string, dueDate: string | null) => void;
}) {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim(), category, dueDate || null);
    setInput("");
    setDueDate("");
  };

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${
              category === cat
                ? (categoryActiveClasses[cat] ?? "bg-[var(--accent-soft)] text-[var(--chip-text)] border-[var(--border-soft)]")
                : "bg-[var(--accent-soft)] text-[var(--text-secondary)] hover:text-[var(--chip-text)] border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="What needs to get done?"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] text-sm text-[var(--text-primary)] placeholder-[var(--muted-text)] focus:outline-none focus:border-[var(--accent-label)] transition-all duration-150"
        />
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium active:scale-95 transition-all duration-150"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          Add
        </button>
      </div>

      {/* Date picker */}
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-label)] transition-all duration-150"
      />
    </div>
  );
}
