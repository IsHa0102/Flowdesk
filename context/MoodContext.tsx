"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Mood = "calm" | "focused" | "tired" | "motivated";

type MoodContextValue = {
  mood: Mood;
  setMood: (mood: Mood) => void;
};

const MoodContext = createContext<MoodContextValue>({
  mood: "calm",
  setMood: () => {},
});

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<Mood>("calm");

  useEffect(() => {
    const saved = localStorage.getItem("fd-mood") as Mood | null;
    const valid: Mood[] = ["calm", "focused", "tired", "motivated"];
    if (saved && valid.includes(saved)) {
      setMoodState(saved);
      document.documentElement.setAttribute("data-mood", saved);
    } else {
      document.documentElement.setAttribute("data-mood", "calm");
    }
  }, []);

  const setMood = useCallback((m: Mood) => {
    setMoodState(m);
    localStorage.setItem("fd-mood", m);
    document.documentElement.setAttribute("data-mood", m);
  }, []);

  return (
    <MoodContext.Provider value={{ mood, setMood }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}
