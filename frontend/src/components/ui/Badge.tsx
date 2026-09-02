import { cn } from "../../utils/cn";
import type { Priority, TaskStatus } from "../../types";
import { priorityMeta, statusMeta } from "../../lib/taskMeta";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = priorityMeta[priority];
  return (
    <span className={cn(base, m.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = statusMeta[status];
  return (
    <span
      className={cn(
        base,
        "bg-fg/4 text-muted ring-1 ring-inset dark:bg-white/5",
        m.ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
    </span>
  );
}
