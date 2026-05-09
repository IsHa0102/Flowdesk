"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import TaskItem from "@/components/TaskItem";
import TaskInput from "@/components/TaskInput";
import ReflectionCard from "@/components/ReflectionCard";
import BottomNav from "@/components/BottomNav";
import PlanMyDay from "@/components/PlanMyDay";
import InsightsCard from "@/components/InsightsCard";
import WellnessCard from "@/components/WellnessCard";
import OverdueCard from "@/components/OverdueCard";
import { computeInsights, buildMemorySummary } from "@/lib/insights";
import { useMood } from "@/context/MoodContext";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  category?: string | null;
  aiCategorized?: boolean;
  dueDate?: string | null;
  createdAt?: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const { mood } = useMood();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflection, setReflection] = useState("Loading...");
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  // Today's workspace: incomplete tasks with no due date or due today,
  // plus completed tasks that were due today or (no due date) created today.
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.completed) {
        if (!t.dueDate) return true;
        return new Date(t.dueDate).toLocaleDateString("en-CA") === todayStr;
      } else {
        if (t.dueDate) {
          return new Date(t.dueDate).toLocaleDateString("en-CA") === todayStr;
        }
        return new Date(t.createdAt ?? todayStr).toLocaleDateString("en-CA") === todayStr;
      }
    });
  }, [tasks, todayStr]);

  // Overdue: incomplete tasks whose due date has already passed
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate).toLocaleDateString("en-CA") < todayStr;
    });
  }, [tasks, todayStr]);

  const insights = useMemo(() => computeInsights(todayTasks), [todayTasks]);
  const memory   = useMemo(() => buildMemorySummary(tasks), [tasks]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/tasks")
      .then((r) => r.ok ? r.json() : [])
      .then(setTasks);
  }, [status]);

  useEffect(() => {
    const fetchReflection = async () => {
      setReflection("Loading...");
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, memory }),
      });
      const data = await res.json();
      setReflection(data.reflection);
    };
    fetchReflection();
  }, [mood, refreshKey]); // intentionally omit `memory`

  const addTask = async (text: string, category: string, dueDate: string | null) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category, dueDate }),
    });
    if (!res.ok) return;
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
  };

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

  const filteredTasks = todayTasks.filter((t: Task) => {
    if (filter === "active") return !t.completed;
    if (filter === "done")   return t.completed;
    return true;
  });

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--accent-soft)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  // ─── Unauthenticated ───────────────────────────────────────────────────────
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-10 space-y-8 text-center">
          <div className="space-y-2">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-white text-lg">✦</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--heading-color)]">FlowDesk</h1>
            <p className="text-sm text-[var(--text-secondary)]">Your calm, focused workspace</p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--accent-soft)] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // ─── Authenticated ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[var(--accent-label)] uppercase tracking-widest font-medium">FlowDesk</p>
            <h1 className="text-xl font-semibold text-[var(--heading-color)] mt-0.5">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-5 text-sm text-[var(--text-secondary)]">
            <Link href="/planner"     className="hover:text-[var(--heading-color)] transition">Weekly Planner</Link>
            <Link href="/growth"      className="hover:text-[var(--heading-color)] transition">Growth</Link>
            <Link href="/vision-board"className="hover:text-[var(--heading-color)] transition">Board</Link>
            <Link href="/profile"     className="hover:text-[var(--heading-color)] transition">Profile</Link>
            <button onClick={() => signOut()} className="hover:text-[var(--heading-color)] transition">Sign out</button>
          </div>
          <Link
            href="/profile"
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {session.user?.name?.[0] ?? "?"}
          </Link>
        </header>

        {/* Reflection — mood selector inside, no mood/onMoodChange props needed */}
        <ReflectionCard
          reflection={reflection}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />

        {/* Tasks */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">Tasks</h2>
              {insights.total > 0 && (
                <span className="text-xs text-[var(--text-secondary)]">
                  {insights.completed}/{insights.total} done
                </span>
              )}
            </div>
            <PlanMyDay />
          </div>

          {/* Progress bar */}
          {insights.total > 0 && (
            <div className="w-full h-1.5 bg-[var(--border-soft)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${insights.completionPct}%`, background: "var(--accent)" }}
              />
            </div>
          )}

          <TaskInput onAdd={addTask} />

          {/* Filter tabs */}
          {insights.total > 0 && (
            <div className="flex gap-1 border-b border-[var(--border-soft)] pb-1">
              {(["all", "active", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors duration-150 capitalize ${
                    filter === f
                      ? "bg-[var(--accent-soft)] text-[var(--heading-color)] font-medium"
                      : "text-[var(--text-secondary)] hover:text-[var(--heading-color)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-6">
              {filter === "done"
                ? "Nothing completed yet — your wins are still ahead."
                : "Your space is clear. Add something intentional."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredTasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </ul>
          )}
        </div>

        {/* Overdue — collapsed by default, gentle non-judgmental tone */}
        <OverdueCard tasks={overdueTasks} onToggle={toggleTask} onDelete={deleteTask} />

        {/* Wellness */}
        <WellnessCard />

        {/* Insights */}
        <InsightsCard data={insights} />

      </div>
      <BottomNav />
    </div>
  );
}
