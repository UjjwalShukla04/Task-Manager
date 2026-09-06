import {
  isToday,
  isPast,
  endOfDay,
  endOfWeek,
  addWeeks,
  addDays,
  isAfter,
} from "date-fns";
import type { Task } from "../types";

export const DEADLINE_BUCKETS = [
  "overdue",
  "today",
  "thisWeek",
  "nextWeek",
  "noDeadline",
  "overTwoWeeks",
  "completed",
] as const;

export type DeadlineBucket = (typeof DEADLINE_BUCKETS)[number];

interface BucketConfig {
  label: string;
  dot: string;
  /** Can a card be dropped here? */
  droppable: boolean;
  /** Show the inline quick-add composer? */
  quickAdd: boolean;
}

export const bucketMeta: Record<DeadlineBucket, BucketConfig> = {
  overdue: { label: "Overdue", dot: "bg-rose-500", droppable: false, quickAdd: false },
  today: { label: "Due today", dot: "bg-amber-500", droppable: true, quickAdd: true },
  thisWeek: { label: "Due this week", dot: "bg-sky-500", droppable: true, quickAdd: true },
  nextWeek: { label: "Due next week", dot: "bg-violet-500", droppable: true, quickAdd: true },
  noDeadline: { label: "No deadline", dot: "bg-slate-400", droppable: true, quickAdd: true },
  overTwoWeeks: { label: "Due over two weeks", dot: "bg-teal-500", droppable: true, quickAdd: true },
  completed: { label: "Completed", dot: "bg-emerald-500", droppable: true, quickAdd: false },
};

const WEEK = { weekStartsOn: 1 } as const; // Monday

export function deadlineBucket(task: Task): DeadlineBucket {
  if (task.status === "Completed") return "completed";
  if (!task.dueDate) return "noDeadline";

  const due = new Date(task.dueDate);
  if (isPast(due) && !isToday(due)) return "overdue";
  if (isToday(due)) return "today";

  const endThisWeek = endOfWeek(new Date(), WEEK);
  const endNextWeek = endOfWeek(addWeeks(new Date(), 1), WEEK);

  if (!isAfter(due, endThisWeek)) return "thisWeek";
  if (!isAfter(due, endNextWeek)) return "nextWeek";
  return "overTwoWeeks";
}

/**
 * The change to apply when a task is dropped into / created in a bucket.
 * `null` dueDate clears the deadline; `status` set completes the task.
 */
export function bucketChange(
  bucket: DeadlineBucket
): { dueDate?: string | null; status?: "Completed" } {
  const now = new Date();
  switch (bucket) {
    case "today":
      return { dueDate: endOfDay(now).toISOString() };
    case "thisWeek":
      return { dueDate: endOfDay(endOfWeek(now, WEEK)).toISOString() };
    case "nextWeek":
      return { dueDate: endOfDay(endOfWeek(addWeeks(now, 1), WEEK)).toISOString() };
    case "overTwoWeeks":
      return { dueDate: endOfDay(addDays(now, 21)).toISOString() };
    case "noDeadline":
      return { dueDate: null };
    case "completed":
      return { status: "Completed" };
    default:
      return {};
  }
}

/** Due date to pre-fill for quick-add in a bucket (null = no deadline). */
export function quickAddDate(bucket: DeadlineBucket): string | null {
  const c = bucketChange(bucket);
  return "dueDate" in c ? (c.dueDate ?? null) : null;
}

export function groupByBucket(tasks: Task[]): Record<DeadlineBucket, Task[]> {
  const groups = Object.fromEntries(
    DEADLINE_BUCKETS.map((b) => [b, [] as Task[]])
  ) as Record<DeadlineBucket, Task[]>;

  for (const t of tasks) groups[deadlineBucket(t)].push(t);

  for (const b of DEADLINE_BUCKETS) {
    groups[b].sort((a, z) => {
      const av = a.dueDate ? +new Date(a.dueDate) : Infinity;
      const zv = z.dueDate ? +new Date(z.dueDate) : Infinity;
      return av - zv;
    });
  }
  return groups;
}
