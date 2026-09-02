import { cn } from "../../utils/cn";
import type { Priority, TaskStatus } from "../../types";

const priorityStyles: Record<Priority, string> = {
  Low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Medium: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  High: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Urgent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const statusStyles: Record<TaskStatus, string> = {
  ToDo: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  InProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Review: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const base =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn(base, priorityStyles[priority])}>
      <span aria-hidden>●</span> {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    ToDo: "To Do",
    InProgress: "In Progress",
    Review: "Review",
    Completed: "Completed",
  };
  return <span className={cn(base, statusStyles[status])}>{labels[status]}</span>;
}
