"use client";

const MOODS = [
  { value: "calm", emoji: "🌿", label: "Calm" },
  { value: "focused", emoji: "🎯", label: "Focused" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "motivated", emoji: "🔥", label: "Motivated" },
];

export default function ReflectionCard({
  reflection,
  mood,
  onMoodChange,
  onRefresh,
}: {
  reflection: string;
  mood: string;
  onMoodChange: (mood: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Daily Reflection
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-150 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
            <path
              d="M2 8a6 6 0 1 1 1.5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M2 12V8h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Mood selector */}
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => onMoodChange(m.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150 ${
              mood === m.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Reflection text */}
      <p
        className={`text-sm leading-relaxed text-gray-600 transition-opacity duration-300 ${
          reflection === "Loading..." ? "opacity-40" : "opacity-100"
        }`}
      >
        {reflection}
      </p>
    </div>
  );
}
