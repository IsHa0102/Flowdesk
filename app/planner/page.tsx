"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  category?: string | null;
  dueDate?: string | Date | null;
};

const categoryColors: Record<string, string> = {
  Personal:     "bg-violet-100 text-violet-700",
  Work:         "bg-blue-100 text-blue-700",
  Health:       "bg-emerald-100 text-emerald-700",
  Study:        "bg-amber-100 text-amber-700",
  Uncategorized:"bg-stone-100 text-stone-500",
};

// ─── Date helpers ──────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string { return date.toLocaleDateString("en-CA"); }
function startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function addDays(date: Date, n: number): Date { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function isSameDay(a: Date, b: Date): boolean { return toLocalDateString(startOfDay(a)) === toLocalDateString(startOfDay(b)); }
function formatDayLabel(date: Date): string { return date.toLocaleDateString("en-US", { weekday: "short" }); }
function formatMonthDay(date: Date): string { return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

// ─── CalendarStrip ─────────────────────────────────────────────────────────────

function CalendarStrip({
  selectedDate, onSelect, tasksByDate,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date | null) => void;
  tasksByDate: Map<string, number>;
}) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-150 border ${
            selectedDate === null
              ? "text-white border-transparent"
              : "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--accent-soft)]"
          }`}
          style={selectedDate === null ? { background: "var(--accent)", boxShadow: "0 4px 12px var(--glow)" } : {}}
        >
          <span className="text-xs font-medium">All</span>
          <span className={`text-xs mt-0.5 ${selectedDate === null ? "opacity-70" : "opacity-60"}`}>dates</span>
        </button>

        {days.map((day) => {
          const key = toLocalDateString(day);
          const isToday    = isSameDay(day, today);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const count = tasksByDate.get(key) ?? 0;

          return (
            <button
              key={key}
              onClick={() => onSelect(isSelected ? null : day)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-150 min-w-[52px] border ${
                isSelected
                  ? "text-white border-transparent"
                  : isToday
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--border-soft)]"
                  : "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--accent-soft)]"
              }`}
              style={isSelected ? { background: "var(--accent)", boxShadow: "0 4px 12px var(--glow)" } : {}}
            >
              <span className="text-xs font-medium">{formatDayLabel(day)}</span>
              <span className={`text-base font-semibold leading-tight ${isSelected ? "text-white" : ""}`}>
                {day.getDate()}
              </span>
              {count > 0 && (
                <span
                  className="mt-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: isSelected ? "rgba(255,255,255,0.7)" : "var(--accent)" }}
                />
              )}
              {count === 0 && <span className="mt-1 w-1.5 h-1.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PlannerTaskItem ───────────────────────────────────────────────────────────

function PlannerTaskItem({ task, onToggle, onDelete, onReschedule }: {
  task: Task;
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
  onReschedule: (t: Task, date: string | null) => void;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(
    task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-CA") : ""
  );
  const today = new Date().toLocaleDateString("en-CA");
  const colorClass = categoryColors[task.category ?? ""] ?? "bg-stone-100 text-stone-500";

  const save = () => { onReschedule(task, dateValue || null); setEditingDate(false); };

  return (
    <li className="group flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] hover:border-[var(--accent-label)] hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task)}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          style={
            task.completed
              ? { borderColor: "var(--accent)", background: "var(--accent)" }
              : { borderColor: "var(--border-soft)" }
          }
          onMouseEnter={(e) => { if (!task.completed) e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={(e) => { if (!task.completed) e.currentTarget.style.borderColor = "var(--border-soft)"; }}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <span className={`flex-1 text-sm leading-relaxed ${task.completed ? "line-through text-[var(--muted-text)]" : "text-[var(--text-primary)]"}`}>
          {task.text}
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {task.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {task.category}
            </span>
          )}
          {!task.completed && (
            <button
              onClick={() => setEditingDate((v) => !v)}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-xs text-[var(--muted-text)] hover:text-[var(--accent)] active:text-[var(--accent)] transition-all duration-150 p-1"
              title="Change date"
            >
              edit
            </button>
          )}
          <button
            onClick={() => onDelete(task)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[var(--muted-text)] hover:text-red-400 active:text-red-400 transition-all duration-150 text-xs p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {editingDate && (
        <div className="flex items-center gap-2 pl-8">
          <input
            type="date"
            value={dateValue}
            min={today}
            onChange={(e) => setDateValue(e.target.value)}
            className="text-xs px-3 py-1 rounded-lg border border-[var(--border-soft)] bg-[var(--accent-soft)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-label)] transition-all"
          />
          <button
            onClick={save}
            className="text-xs px-3 py-1 rounded-lg text-white transition"
            style={{ background: "var(--accent)" }}
          >
            Save
          </button>
          {dateValue && (
            <button
              onClick={() => { setDateValue(""); onReschedule(task, null); setEditingDate(false); }}
              className="text-xs text-[var(--accent-label)] hover:text-[var(--accent)] transition"
            >
              Clear
            </button>
          )}
          <button onClick={() => setEditingDate(false)} className="text-xs text-[var(--muted-text)] hover:text-[var(--accent)] transition">
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

function Section({ title, subtitle, tasks, onToggle, onDelete, onReschedule, accent }: {
  title: string;
  subtitle?: string;
  tasks: Task[];
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
  onReschedule: (t: Task, date: string | null) => void;
  accent?: string;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className={`text-xs font-semibold uppercase tracking-widest ${accent ?? "text-[var(--accent-label)]"}`}>
          {title}
        </h3>
        {subtitle && <span className="text-xs text-[var(--accent-label)]">{subtitle}</span>}
        <span className="text-xs text-[var(--muted-text)] ml-auto">{tasks.length}</span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <PlannerTaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onReschedule={onReschedule} />
        ))}
      </ul>
    </div>
  );
}

// ─── Planner Page ──────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/tasks")
      .then((r) => r.ok ? r.json() : [])
      .then(setTasks);
  }, [status]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.completed && t.dueDate) {
        const key = toLocalDateString(startOfDay(new Date(t.dueDate)));
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    });
    return map;
  }, [tasks]);

  const today    = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const { todayTasks, tomorrowTasks, upcomingTasks, overdueTasks, undatedTasks } = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    const inDateFilter = (t: Task) => {
      if (!selectedDate) return true;
      if (!t.dueDate) return isSameDay(selectedDate, today);
      return isSameDay(new Date(t.dueDate), selectedDate);
    };
    const filtered = pending.filter(inDateFilter);
    const todayTasks: Task[] = [], tomorrowTasks: Task[] = [], upcomingTasks: Task[] = [], overdueTasks: Task[] = [], undatedTasks: Task[] = [];
    filtered.forEach((t) => {
      if (!t.dueDate) { todayTasks.push(t); return; }
      const due = startOfDay(new Date(t.dueDate));
      if (isSameDay(due, today))    todayTasks.push(t);
      else if (isSameDay(due, tomorrow)) tomorrowTasks.push(t);
      else if (due > tomorrow)      upcomingTasks.push(t);
      else                           overdueTasks.push(t);
    });
    upcomingTasks.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    return { todayTasks, tomorrowTasks, upcomingTasks, overdueTasks, undatedTasks };
  }, [tasks, selectedDate]);

  const totalPending = tasks.filter((t) => !t.completed).length;
  const totalDated   = tasks.filter((t) => !t.completed && t.dueDate).length;

  const toggleTask = async (task: Task) => {
    const res = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, completed: !task.completed }) });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = async (task: Task) => {
    await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id }) });
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const rescheduleTask = async (task: Task, newDate: string | null) => {
    const res = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, dueDate: newDate }) });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent-soft)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-label)] text-sm">
        <Link href="/" className="hover:text-[var(--accent)] transition">Sign in to view planner</Link>
      </div>
    );
  }

  const hasAnything = todayTasks.length + tomorrowTasks.length + upcomingTasks.length + overdueTasks.length + undatedTasks.length > 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">

        <header className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[var(--accent-label)] uppercase tracking-widest font-medium">FlowDesk</p>
            <h1 className="text-xl font-semibold text-[var(--heading-color)] mt-0.5">Weekly Planner</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--accent-label)]">
            <Link href="/"        className="hidden md:block hover:text-[var(--heading-color)] transition">Dashboard</Link>
            <Link href="/profile" className="hidden md:block hover:text-[var(--heading-color)] transition">Profile</Link>
            <Link
              href="/profile"
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {session.user?.name?.[0] ?? "?"}
            </Link>
          </div>
        </header>

        {/* Summary */}
        <div className="flex items-center gap-3 text-xs text-[var(--accent-label)]">
          <span>{totalPending} pending</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent-soft)" }} />
          <span>{totalDated} scheduled</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent-soft)" }} />
          <span>{totalPending - totalDated} unscheduled</span>
        </div>

        <CalendarStrip selectedDate={selectedDate} onSelect={setSelectedDate} tasksByDate={tasksByDate} />

        {selectedDate && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatMonthDay(selectedDate)}
              {isSameDay(selectedDate, today) && (
                <span className="ml-2 text-xs font-normal text-[var(--accent-label)]">Today</span>
              )}
            </p>
            <button onClick={() => setSelectedDate(null)} className="text-xs text-[var(--accent-label)] hover:text-[var(--accent)] transition">
              Show all
            </button>
          </div>
        )}

        {!hasAnything ? (
          <div className="bg-[var(--card-bg)] border border-dashed border-[var(--border-soft)] rounded-2xl p-10 text-center space-y-2">
            <p className="text-sm text-[var(--accent-label)]">
              {selectedDate ? `No tasks scheduled for ${formatMonthDay(selectedDate)}` : "No pending tasks — all clear!"}
            </p>
            <Link href="/" className="text-xs text-[var(--accent-label)] hover:text-[var(--accent)] transition underline underline-offset-2">
              Add tasks on dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <Section title="Overdue"  tasks={overdueTasks}  onToggle={toggleTask} onDelete={deleteTask} onReschedule={rescheduleTask} accent="text-red-400" />
            <Section title="Today"    subtitle={formatMonthDay(today)}    tasks={todayTasks}    onToggle={toggleTask} onDelete={deleteTask} onReschedule={rescheduleTask} accent="text-[var(--accent)]" />
            <Section title="Tomorrow" subtitle={formatMonthDay(tomorrow)} tasks={tomorrowTasks} onToggle={toggleTask} onDelete={deleteTask} onReschedule={rescheduleTask} accent="text-[var(--text-secondary)]" />
            <Section title="Upcoming" tasks={upcomingTasks} onToggle={toggleTask} onDelete={deleteTask} onReschedule={rescheduleTask} />
            {!selectedDate && <Section title="No date" tasks={undatedTasks} onToggle={toggleTask} onDelete={deleteTask} onReschedule={rescheduleTask} />}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
