"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full py-3 rounded-2xl border border-[var(--border-soft)] text-sm text-[var(--text-secondary)] hover:text-red-400 hover:border-red-200 transition-colors duration-150"
    >
      Sign out
    </button>
  );
}
