import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import SignOutButton from "@/components/SignOutButton";

const categoryColors: Record<string, string> = {
  Personal:     "bg-violet-100 text-violet-700",
  Work:         "bg-blue-100 text-blue-700",
  Health:       "bg-emerald-100 text-emerald-700",
  Study:        "bg-amber-100 text-amber-700",
  Uncategorized:"bg-stone-100 text-stone-500",
};

const categoryBarColors: Record<string, string> = {
  Personal: "bg-violet-400",
  Work:     "bg-blue-400",
  Health:   "bg-emerald-400",
  Study:    "bg-amber-400",
  Uncategorized: "bg-stone-400",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tasks: true },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-secondary)] text-sm">
        No data found.
      </div>
    );
  }

  const totalTasks      = user.tasks.length;
  const completedTasks  = user.tasks.filter((t) => t.completed).length;
  const completionRate  = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const categoryStats = user.tasks.reduce((acc: Record<string, number>, task) => {
    const cat = task.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const firstName = user.name?.split(" ")[0] ?? "User";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">

        <header className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[var(--accent-label)] uppercase tracking-widest font-medium">FlowDesk</p>
            <h1 className="text-xl font-semibold text-[var(--heading-color)] mt-0.5">Profile</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-[var(--accent-label)] hover:text-[var(--heading-color)] transition-colors duration-150 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </header>

        {/* User card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{ background: "var(--accent)" }}
          >
            {firstName[0]}
          </div>
          <div>
            <p className="font-medium text-[var(--heading-color)]">{user.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Tasks", value: totalTasks },
            { label: "Completed",   value: completedTasks },
            { label: "Rate",        value: `${completionRate}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-5 text-center space-y-1"
            >
              <p className="text-2xl font-semibold text-[var(--heading-color)]">{stat.value}</p>
              <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        {totalTasks > 0 && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
                Overall Progress
              </p>
              <span className="text-sm font-medium text-[var(--text-primary)]">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--border-soft)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%`, background: "var(--accent)" }}
              />
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {Object.keys(categoryStats).length > 0 && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-label)]">
              Tasks by Category
            </h2>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, count]) => {
                const pct = totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);
                const colorClass = categoryColors[cat] ?? "bg-stone-100 text-stone-500";
                const barColor   = categoryBarColors[cat] ?? "bg-stone-400";
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>{cat}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{count} task{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--border-soft)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SignOutButton />

      </div>
      <BottomNav />
    </div>
  );
}
