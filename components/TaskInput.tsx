"use client";

import { useState } from "react";

const CATEGORIES = ["Personal", "Work", "Health", "Study"];

export default function TaskInput({
  onAdd,
}: {
  onAdd: (text: string, category: string) => void;
}) {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Personal");

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim(), category);
    setInput("");
  };

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
              category === cat
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-150"
        />
        <button
          onClick={handleAdd}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black active:scale-95 transition-all duration-150"
        >
          Add
        </button>
      </div>
    </div>
  );
}
