"use client";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  category?: string | null;
  aiCategorized?: boolean;
  dueDate?: string | null;
  createdAt?: string;
};

const categoryColors: Record<string, string> = {
  Personal:     "bg-violet-100 text-violet-700",
  Work:         "bg-blue-100 text-blue-700",
  Health:       "bg-emerald-100 text-emerald-700",
  Study:        "bg-amber-100 text-amber-700",
  Uncategorized:"bg-stone-100 text-stone-500",
};

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  darkTheme: _darkTheme,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  darkTheme?: boolean;
}) {
  const colorClass = categoryColors[task.category ?? ""] ?? "bg-stone-100 text-stone-500";

  return (
    <li className="task-item group flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] hover:border-[var(--accent-label)] hover:shadow-sm transition-all duration-200">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
        style={
          task.completed
            ? { borderColor: "var(--accent)", background: "var(--accent)" }
            : { borderColor: "var(--border-soft)" }
        }
        onMouseEnter={(e) => {
          if (!task.completed) e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          if (!task.completed) e.currentTarget.style.borderColor = "var(--border-soft)";
        }}
        aria-label="Toggle task"
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
          task.completed
            ? "line-through text-[var(--muted-text)]"
            : "text-[var(--text-primary)]"
        }`}
      >
        {task.text}
      </span>

      {/* Category badge */}
      {task.category && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
          {task.category}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(task)}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[var(--muted-text)] hover:text-red-400 active:text-red-400 transition-all duration-150 text-xs ml-1 p-1"
        aria-label="Delete task"
      >
        ✕
      </button>
    </li>
  );
}
