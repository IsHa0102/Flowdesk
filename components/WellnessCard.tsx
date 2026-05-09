"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const WATER_GOAL = 8;
const SLEEP_OPTIONS = [4, 5, 6, 7, 7.5, 8, 9, 10];

function getSleepInfo(h: number): { label: string; color: string } {
  if (h <= 5) return { label: "Poor recovery",  color: "text-rose-400" };
  if (h <= 6) return { label: "Light recovery", color: "text-amber-500" };
  if (h < 8)  return { label: "Good recovery",  color: "text-emerald-500" };
  return            { label: "Deep recovery",  color: "text-violet-500" };
}

const MOVEMENT_LEVELS = [
  { level: 1, emoji: "🧘", label: "Mostly still", activeClass: "bg-stone-100 text-stone-600 border-stone-200" },
  { level: 2, emoji: "🚶", label: "Light",        activeClass: "bg-[#FFF8E0] text-[#A08820] border-[#E8D080]" },
  { level: 3, emoji: "🏃", label: "Active",       activeClass: "bg-[#E8F0E8] text-[#4A7C59] border-[#B5D5B5]" },
  { level: 4, emoji: "⚡", label: "Very active",  activeClass: "bg-[#EDE8F5] text-[#6B5B95] border-[#C5B5D5]" },
  { level: 5, emoji: "🔥", label: "High energy",  activeClass: "bg-[#FFF0EC] text-[#C06040] border-[#F0B090]" },
];

const spring = { type: "spring" as const, stiffness: 500, damping: 25 };

export default function WellnessCard() {
  const [water,    setWater]    = useState(0);
  const [sleep,    setSleep]    = useState<number | null>(null);
  const [movement, setMovement] = useState<number | null>(null);
  const [loaded,   setLoaded]   = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/wellness")
      .then((r) => r.json())
      .then((data) => {
        if (data.entry) {
          setWater(data.entry.waterGlasses ?? 0);
          setSleep(data.entry.sleepHours ?? null);
          setMovement(data.entry.movementLevel ?? null);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const scheduleSave = (w: number, s: number | null, m: number | null) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterGlasses: w, sleepHours: s, movementLevel: m }),
      });
    }, 500);
  };

  const handleWater    = (n: number) => { const next = water === n ? n - 1 : n;       setWater(next);    scheduleSave(next, sleep, movement); };
  const handleSleep    = (h: number) => { const next = sleep === h ? null : h;         setSleep(next);    scheduleSave(water, next, movement); };
  const handleMovement = (l: number) => { const next = movement === l ? null : l;      setMovement(next); scheduleSave(water, sleep, next); };

  const sleepInfo = sleep !== null ? getSleepInfo(sleep) : null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
          Body Check-in
        </h2>
        <span className="text-xs text-[var(--muted-text)]">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* ── Water ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Hydration</p>
          <span className="text-xs text-sky-400 tabular-nums">
            {loaded ? `${water} / ${WATER_GOAL} glasses` : "—"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {Array.from({ length: WATER_GOAL }, (_, i) => {
            const n = i + 1;
            const filled = n <= water;
            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.82 }}
                transition={spring}
                onClick={() => handleWater(n)}
                aria-label={`${n} glass${n > 1 ? "es" : ""}`}
                className={`h-14 rounded-[20px] border transition-colors duration-200 ${
                  filled
                    ? "bg-gradient-to-b from-sky-200 to-cyan-300 border-cyan-200 shadow-sm shadow-cyan-100"
                    : "bg-sky-50 border-sky-100 hover:border-sky-200 hover:bg-sky-100"
                }`}
              />
            );
          })}
        </div>

        <p className="text-xs text-[var(--muted-text)] italic leading-relaxed">
          Hydration helps sustain focus and mental clarity.
        </p>
      </div>

      <div className="h-px bg-[var(--border-soft)]" />

      {/* ── Sleep ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Sleep last night</p>
          {sleepInfo && (
            <motion.span
              key={sleep}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-xs font-medium ${sleepInfo.color}`}
            >
              {sleep}h · {sleepInfo.label}
            </motion.span>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {SLEEP_OPTIONS.map((h) => {
            const active = sleep === h;
            return (
              <motion.button
                key={h}
                whileTap={{ scale: 0.88 }}
                transition={spring}
                onClick={() => handleSleep(h)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors duration-200 border ${
                  active
                    ? "bg-[#EDE8F5] text-[#6B5B95] border-[#C5B5D5] shadow-sm"
                    : "bg-[var(--accent-soft)] text-[var(--text-secondary)] border-transparent hover:text-[var(--chip-text)]"
                }`}
              >
                {h}h
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[var(--border-soft)]" />

      {/* ── Movement ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-[var(--text-secondary)]">How much did you move today?</p>
        <div className="flex gap-2 flex-wrap">
          {MOVEMENT_LEVELS.map(({ level, emoji, label, activeClass }) => {
            const active = movement === level;
            return (
              <motion.button
                key={level}
                whileTap={{ scale: 0.88 }}
                transition={spring}
                onClick={() => handleMovement(level)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors duration-200 border ${
                  active
                    ? activeClass
                    : "bg-[var(--accent-soft)] text-[var(--text-secondary)] border-transparent hover:text-[var(--chip-text)]"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
