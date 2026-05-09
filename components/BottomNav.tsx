"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/planner",
    label: "Weekly",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/growth",
    label: "Growth",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12C12 12 8 10 6 6c4 0 6 2 6 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 12C12 12 16 10 18 6c-4 0-6 2-6 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 16C12 16 9 14.5 8 11c3 0 4 2 4 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/vision-board",
    label: "Board",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

export default function FloatingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentItem = NAV_ITEMS.find((item) => item.href === pathname);

  return (
    <>
      {/* ── Tap-outside backdrop ─────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile + tablet floating dock ────────────────────────── */}
      <div
        className="fixed right-5 z-50 lg:hidden flex flex-col items-end gap-2.5"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Expanded nav items */}
        <AnimatePresence>
          {open && (
            <motion.div className="flex flex-col gap-2 items-end">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                const enterDelay = (NAV_ITEMS.length - 1 - i) * 0.045;
                const exitDelay = i * 0.028;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 24, scale: 0.88 }}
                    animate={{ opacity: 1, x: 0, scale: 1, transition: { ...spring, delay: enterDelay } }}
                    exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.13, delay: exitDelay } }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-[18px] border shadow-sm transition-colors duration-150 ${
                        isActive
                          ? "text-white border-transparent"
                          : "border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      }`}
                      style={{
                        background: isActive ? "var(--accent)" : "rgba(255,255,255,0.90)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        boxShadow: isActive ? "0 4px 16px var(--glow)" : undefined,
                      }}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={spring}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="w-14 h-14 rounded-[20px] text-white flex items-center justify-center relative overflow-hidden"
          style={{
            background: "var(--accent)",
            boxShadow: "0 8px 24px var(--glow)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={spring}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="current"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={spring}
              >
                {currentItem?.icon ?? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Desktop sidebar rail (lg+) ────────────────────────────── */}
      <nav
        className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 flex-col gap-1 p-2 rounded-[26px] border border-[var(--border-soft)] shadow-sm"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`p-3 rounded-[16px] transition-all duration-200 ${
                isActive
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              }`}
              style={isActive ? { background: "var(--accent)", boxShadow: "0 2px 8px var(--glow)" } : {}}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
