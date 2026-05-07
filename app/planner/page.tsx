"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Task, categoryColors } from "@/components/TaskItem";
import BottomNav from "@/components/BottomNav";

// ─── Date helpers ──────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return toLocalDateString(startOfDay(a)) === toLocalDateString(startOfDay(b));
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatMonthDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── CalendarStrip ─────────────────────────────────────────────────────────────

function CalendarStrip({
  selectedDate,
  onSelect,
  tasksByDate,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date | null) => void;
  tasksByDate: Map<string, number>; // dateStr → pending count
}) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* "All" chip */}
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-150 ${
            selectedDate === null
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <span className="text-xs font-medium">All</span>
          <span className="text-xs opacity-60 mt-0.5">dates</span>
        </button>

        {days.map((day) => {
          const key = toLocalDateString(day);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const count = tasksByDate.get(key) ?? 0;

          return (
            <button
              key={key}
              onClick={() => onSelect(isSelected ? null : day)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-150 min-w-[52px] ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : isToday
                  ? "bg-gray-100 text-gray-800"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs font-medium">{formatDayLabel(day)}</span>
              <span className={`text-base font-semibold leading-tight ${isSelected ? "text-white" : ""}`}>
                {day.getDate()}
              </span>
              {/* Task dot indicator */}
              {count > 0 && (
                <span
                  className={`mt-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-white opacity-70" : "bg-gray-400"
                  }`}
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

function PlannerTaskItem({
  task,
  onToggle,
  onDelete,
  onReschedule,
}: {
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
  const colorClass = categoryColors[task.category ?? ""] ?? "bg-gray-100 text-gray-500";

  const save = () => {
    onReschedule(task, dateValue || null);
    setEditingDate(false);
  };

  return (
    <li className="group flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed ? "border-gray-900 bg-gray-900" : "border-gray-300 hover:border-gray-500"
          }`}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Text */}
        <span className={`flex-1 text-sm leading-relaxed ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.text}
        </span>

        {/* Badges + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
              {task.category}
            </span>
          )}
          {!task.completed && (
            <button
              onClick={() => setEditingDate((v) => !v)}
              className="opacity-0 group-hover:opacity-100 text-xs text-gray-300 hover:text-gray-600 transition-all duration-150"
              title="Change date"
            >
              edit
            </button>
          )}
          <button
            onClick={() => onDelete(task)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-150 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Inline reschedule */}
      {editingDate && (
        <div className="flex items-center gap-2 pl-8">
          <input
            type="date"
            value={dateValue}
            min={today}
            onChange={(e) => setDateValue(e.target.value)}
            className="text-xs px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-gray-400 transition-all"
          />
          <button onClick={save} className="text-xs px-3 py-1 rounded-lg bg-gray-900 text-white hover:bg-black transition">
            Save
          </button>
          {dateValue && (
            <button
              onClick={() => { setDateValue(""); onReschedule(task, null); setEditingDate(false); }}
              className="text-xs text-gray-400 hover:text-gray-700 transition"
            >
              Clear
            </button>
          )}
          <button onClick={() => setEditingDate(false)} className="text-xs text-gray-300 hover:text-gray-500 transition">
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  tasks,
  onToggle,
  onDelete,
  onReschedule,
  accent,
}: {
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
        <h3 className={`text-xs font-semibold uppercase tracking-widest ${accent ?? "text-gray-400"}`}>
          {title}
        </h3>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        <span className="text-xs text-gray-300 ml-auto">{tasks.length}</span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <PlannerTaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onReschedule={onReschedule}
          />
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

  // Task → date buckets (only pending, with a due date)
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

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  // Grouped buckets — filtered by selectedDate if set
  const { todayTasks, tomorrowTasks, upcomingTasks, overdueTasks, undatedTasks } = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);

    const inDateFilter = (t: Task) => {
      if (!selectedDate) return true;
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate), selectedDate);
    };

    const filtered = pending.filter(inDateFilter);

    const todayTasks: Task[] = [];
    const tomorrowTasks: Task[] = [];
    const upcomingTasks: Task[] = [];
    const overdueTasks: Task[] = [];
    const undatedTasks: Task[] = [];

    filtered.forEach((t) => {
      if (!t.dueDate) {
        undatedTasks.push(t);
        return;
      }
      const due = startOfDay(new Date(t.dueDate));
      if (isSameDay(due, today)) todayTasks.push(t);
      else if (isSameDay(due, tomorrow)) tomorrowTasks.push(t);
      else if (due > tomorrow) upcomingTasks.push(t);
      else overdueTasks.push(t);
    });

    // Sort upcoming by date
    upcomingTasks.sort((a, b) =>
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );

    return { todayTasks, tomorrowTasks, upcomingTasks, overdueTasks, undatedTasks };
  }, [tasks, selectedDate]);

  const totalPending = tasks.filter((t) => !t.completed).length;
  const totalDated = tasks.filter((t) => !t.completed && t.dueDate).length;

  const toggleTask = async (task: Task) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = async (task: Task) => {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const rescheduleTask = async (task: Task, newDate: string | null) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, dueDate: newDate }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // ─── Auth guard ──────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        <Link href="/" className="hover:text-gray-700 transition">Sign in to view planner</Link>
      </div>
    );
  }

  const hasAnything =
    todayTasks.length + tomorrowTasks.length + upcomingTasks.length + overdueTasks.length + undatedTasks.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">FlowDesk</p>
            <h1 className="text-xl font-semibold text-gray-900 mt-0.5">Planner</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/" className="hidden md:block hover:text-gray-800 transition">Dashboard</Link>
            <Link href="/profile" className="hidden md:block hover:text-gray-800 transition">Profile</Link>
            {/* Mobile avatar */}
            <Link
              href="/profile"
              className="md:hidden w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
            >
              {session.user?.name?.[0] ?? "?"}
            </Link>
          </div>
        </header>

        {/* Summary pill */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{totalPending} pending</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{totalDated} scheduled</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{totalPending - totalDated} unscheduled</span>
        </div>

        {/* 7-day strip */}
        <CalendarStrip
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          tasksByDate={tasksByDate}
        />

        {/* Selected date header */}
        {selectedDate && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {formatMonthDay(selectedDate)}
              {isSameDay(selectedDate, today) && (
                <span className="ml-2 text-xs font-normal text-gray-400">Today</span>
              )}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-400 hover:text-gray-700 transition"
            >
              Show all
            </button>
          </div>
        )}

        {/* Task sections */}
        {!hasAnything ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
            <p className="text-sm text-gray-400">
              {selectedDate
                ? `No tasks scheduled for ${formatMonthDay(selectedDate)}`
                : "No pending tasks — all clear!"}
            </p>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 transition underline underline-offset-2">
              Add tasks on dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <Section
              title="Overdue"
              tasks={overdueTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onReschedule={rescheduleTask}
              accent="text-red-400"
            />
            <Section
              title="Today"
              subtitle={formatMonthDay(today)}
              tasks={todayTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onReschedule={rescheduleTask}
              accent="text-gray-700"
            />
            <Section
              title="Tomorrow"
              subtitle={formatMonthDay(tomorrow)}
              tasks={tomorrowTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onReschedule={rescheduleTask}
            />
            <Section
              title="Upcoming"
              tasks={upcomingTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onReschedule={rescheduleTask}
            />
            {!selectedDate && (
              <Section
                title="No date"
                tasks={undatedTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
              />
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}