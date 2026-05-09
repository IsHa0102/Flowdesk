"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import BottomNav from "@/components/BottomNav";
import { useMood } from "@/context/MoodContext";

const MOODS = [
  { value: "calm",      emoji: "🌿", label: "Calm",      activeClass: "bg-[#E8F0E8] text-[#4A7C59] border border-[#B5D5B5]" },
  { value: "focused",   emoji: "🎯", label: "Focused",   activeClass: "bg-[#EDE8F5] text-[#6B5B95] border border-[#C5B5D5]" },
  { value: "tired",     emoji: "😴", label: "Tired",     activeClass: "bg-[#FFF8E0] text-[#A08820] border border-[#E8D080]" },
  { value: "motivated", emoji: "🔥", label: "Motivated", activeClass: "bg-[#FFF0EC] text-[#C06040] border border-[#F0B090]" },
];

export default function GrowthPage() {
  const { data: session, status } = useSession();
  const { mood, setMood } = useMood();

  const [gratitude,      setGratitude]      = useState(["", "", ""]);
  const [win,            setWin]            = useState("");
  const [journalSaved,   setJournalSaved]   = useState(false);
  const [journalLoading, setJournalLoading] = useState(false);

  const [affirmations,    setAffirmations]    = useState(["", "", ""]);
  const [scripting,       setScripting]       = useState("");
  const [manifestSaved,   setManifestSaved]   = useState(false);
  const [manifestLoading, setManifestLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchJournal();
    fetchManifestation();
  }, [session]);

  async function fetchJournal() {
    const res = await fetch("/api/journal");
    const data = await res.json();
    if (data.entry) {
      // Sync journal mood with global theme
      if (data.entry.mood) setMood(data.entry.mood as "calm" | "focused" | "tired" | "motivated");
      setGratitude(data.entry.gratitude ?? ["", "", ""]);
      setWin(data.entry.win ?? "");
    }
  }

  async function fetchManifestation() {
    const res = await fetch("/api/manifestation");
    const data = await res.json();
    if (data.manifestation) {
      setAffirmations(data.manifestation.affirmations ?? ["", "", ""]);
      setScripting(data.manifestation.scripting ?? "");
    }
  }

  async function submitJournal() {
    setJournalLoading(true);
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, gratitude, win }),
    });
    setJournalLoading(false);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2500);
  }

  async function saveManifestation() {
    setManifestLoading(true);
    await fetch("/api/manifestation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affirmations, scripting }),
    });
    setManifestLoading(false);
    setManifestSaved(true);
    setTimeout(() => setManifestSaved(false), 2500);
  }

  function updateGratitude(i: number, val: string) {
    setGratitude((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  }

  function updateAffirmation(i: number, val: string) {
    setAffirmations((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--accent-soft)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-[var(--text-secondary)] text-sm">Sign in to access your growth journal</p>
        <button
          onClick={() => signIn("google")}
          className="px-5 py-2.5 text-white text-sm rounded-xl transition-colors"
          style={{ background: "var(--accent)" }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const inputClass = "w-full text-sm px-3 py-2 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] focus:outline-none focus:border-[var(--accent-label)] text-[var(--text-primary)] placeholder-[var(--muted-text)] transition-colors";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <div className="max-w-lg mx-auto px-4 pt-10 space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-[var(--heading-color)]">Growth</h1>
          <p className="text-xs text-[var(--accent-label)] mt-0.5">{today}</p>
        </div>

        {/* Daily Check-in */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
            Daily Check-in
          </h3>

          {/* Mood — selecting here updates global theme too */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value as "calm" | "focused" | "tired" | "motivated")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150 border ${
                    mood === m.value
                      ? m.activeClass
                      : "bg-[var(--accent-soft)] text-[var(--text-secondary)] border-transparent hover:text-[var(--chip-text)]"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gratitude */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">3 things you&apos;re grateful for</p>
            <div className="space-y-2">
              {["Getting enough sleep", "A friend checking in", "Learning something new"].map((placeholder, i) => (
                <input
                  key={i}
                  type="text"
                  value={gratitude[i]}
                  onChange={(e) => updateGratitude(i, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              ))}
            </div>
          </div>

          {/* Win */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">Win of the day</p>
            <input
              type="text"
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="What went well today?"
              className={inputClass}
            />
          </div>

          <button
            onClick={submitJournal}
            disabled={journalLoading}
            className="w-full py-2.5 text-white text-sm rounded-xl disabled:opacity-50 transition-colors duration-150"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {journalLoading ? "Saving…" : journalSaved ? "Saved ✓" : "Log Check-in"}
          </button>
        </div>

        {/* Manifestation */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
            Manifestation
          </h3>

          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">Your affirmations</p>
            <div className="space-y-2">
              {[
                "I trust my own pace.",
                "I focus on progress, not perfection.",
                "I am creating a peaceful life for myself.",
              ].map((placeholder, i) => (
                <input
                  key={i}
                  type="text"
                  value={affirmations[i]}
                  onChange={(e) => updateAffirmation(i, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">Script your future</p>
            <p className="text-xs text-[var(--muted-text)] -mt-1">Write as if it has already happened</p>
            <textarea
              value={scripting}
              onChange={(e) => setScripting(e.target.value)}
              placeholder="It is 2027 and I am living…"
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            onClick={saveManifestation}
            disabled={manifestLoading}
            className="w-full py-2.5 text-white text-sm rounded-xl disabled:opacity-50 transition-colors duration-150"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {manifestLoading ? "Saving…" : manifestSaved ? "Saved ✓" : "Save Manifestation"}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
