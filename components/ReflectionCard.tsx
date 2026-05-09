"use client";

import { useMood } from "@/context/MoodContext";

const MOODS = [
  { value: "calm",      emoji: "🌿", label: "Calm",      activeClass: "bg-[#E8F0E8] text-[#4A7C59] border border-[#B5D5B5]" },
  { value: "focused",   emoji: "🎯", label: "Focused",   activeClass: "bg-[#EDE8F5] text-[#6B5B95] border border-[#C5B5D5]" },
  { value: "tired",     emoji: "😴", label: "Tired",     activeClass: "bg-[#FFF8E0] text-[#A08820] border border-[#E8D080]" },
  { value: "motivated", emoji: "🔥", label: "Motivated", activeClass: "bg-[#FFF0EC] text-[#C06040] border border-[#F0B090]" },
];

export default function ReflectionCard({
  reflection,
  onRefresh,
}: {
  reflection: string;
  onRefresh: () => void;
}) {
  const { mood, setMood } = useMood();

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
          Daily Reflection
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--heading-color)] transition-colors duration-150 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
            <path d="M2 8a6 6 0 1 1 1.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 12V8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Mood selector — active classes are intentionally per-mood (they preview each mood) */}
      <div className="grid grid-cols-2 sm:flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMood(m.value as "calm" | "focused" | "tired" | "motivated")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all duration-150 border ${
              mood === m.value
                ? m.activeClass
                : "bg-[var(--accent-soft)] text-[var(--text-secondary)] hover:text-[var(--chip-text)] border-transparent"
            }`}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Reflection text */}
      <p
        className={`text-sm leading-relaxed text-[var(--text-primary)] transition-opacity duration-300 ${
          reflection === "Loading..." ? "opacity-30" : "opacity-100"
        }`}
      >
        {reflection}
      </p>
    </div>
  );
}
