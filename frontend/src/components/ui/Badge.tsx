import { cn } from "../../utils/cn";
import type { TaskStatus } from "../../types";
import { statusMeta } from "../../lib/taskMeta";

const base =
  "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[12px] font-medium";

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
