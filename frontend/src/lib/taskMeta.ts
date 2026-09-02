import type { Priority, TaskStatus } from "../types";

export const statusMeta: Record<
  TaskStatus,
  { label: string; dot: string; accent: string; ring: string }
> = {
  ToDo: {
    label: "To Do",
    dot: "bg-slate-400",
    accent: "text-slate-500 dark:text-slate-400",
    ring: "ring-slate-400/30",
  },
  InProgress: {
    label: "In Progress",
    dot: "bg-amber-500",
    accent: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/30",
  },
  Review: {
    label: "Review",
    dot: "bg-violet-500",
    accent: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/30",
  },
  Completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    accent: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/30",
  },
};

export const priorityMeta: Record<
  Priority,
  { label: string; className: string; dot: string }
> = {
  Low: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  Medium: {
    label: "Medium",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  High: {
    label: "High",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Urgent: {
    label: "Urgent",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}
