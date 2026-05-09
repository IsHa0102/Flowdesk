"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskItem from "@/components/TaskItem";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  category?: string | null;
  aiCategorized?: boolean;
  dueDate?: string | null;
  createdAt?: string;
};

interface OverdueCardProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function OverdueCard({ tasks, onToggle, onDelete }: OverdueCardProps) {
  const [open, setOpen] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(253, 246, 232, 0.6)",
        borderColor: "rgba(214, 179, 120, 0.28)",
      }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          {/* Soft clock icon */}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "rgba(180, 130, 60, 0.65)" }}
          >
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(160, 110, 50, 0.75)" }}
          >
            From earlier
          </span>
          <span
            className="text-xs font-normal"
            style={{ color: "rgba(160, 110, 50, 0.55)" }}
          >
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <motion.svg
          viewBox="0 0 10 10"
          fill="none"
          className="w-3 h-3 shrink-0"
          style={{ color: "rgba(160, 110, 50, 0.50)" }}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="overdue-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              <p
                className="text-[11px] leading-relaxed -mt-0.5"
                style={{ color: "rgba(150, 105, 45, 0.50)" }}
              >
                No rush — pick what feels right when you're ready.
              </p>
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
