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
  "later",
] as const;

export type DeadlineBucket = (typeof DEADLINE_BUCKETS)[number];

export const bucketMeta: Record<
  DeadlineBucket,
  { label: string; dot: string; droppable: boolean }
> = {
  overdue: { label: "Overdue", dot: "bg-rose-500", droppable: false },
  today: { label: "Due today", dot: "bg-amber-500", droppable: true },
  thisWeek: { label: "Due this week", dot: "bg-sky-500", droppable: true },
  nextWeek: { label: "Due next week", dot: "bg-violet-500", droppable: true },
  later: { label: "Later", dot: "bg-slate-400", droppable: true },
};

const WEEK = { weekStartsOn: 1 } as const; // Monday

export function deadlineBucket(task: Task): DeadlineBucket {
  const due = new Date(task.dueDate);
  const notDone = task.status !== "Completed";

  if (notDone && isPast(due) && !isToday(due)) return "overdue";
  if (isToday(due)) return "today";

  const endThisWeek = endOfWeek(new Date(), WEEK);
  const endNextWeek = endOfWeek(addWeeks(new Date(), 1), WEEK);

  if (!isAfter(due, endThisWeek)) return "thisWeek";
  if (!isAfter(due, endNextWeek)) return "nextWeek";
  return "later";
}

/** Representative due date when a task is dropped into / created in a bucket. */
export function bucketTargetIso(bucket: DeadlineBucket): string {
  const now = new Date();
  switch (bucket) {
    case "today":
      return endOfDay(now).toISOString();
    case "thisWeek":
      return endOfDay(endOfWeek(now, WEEK)).toISOString();
    case "nextWeek":
      return endOfDay(endOfWeek(addWeeks(now, 1), WEEK)).toISOString();
    case "later":
      return endOfDay(addDays(now, 21)).toISOString();
    default:
      return endOfDay(now).toISOString();
  }
}

/** Completed tasks are omitted — the deadline view is for scheduling open work. */
export function groupByBucket(tasks: Task[]): Record<DeadlineBucket, Task[]> {
  const groups = {
    overdue: [] as Task[],
    today: [] as Task[],
    thisWeek: [] as Task[],
    nextWeek: [] as Task[],
    later: [] as Task[],
  };
  for (const t of tasks) {
    if (t.status === "Completed") continue;
    groups[deadlineBucket(t)].push(t);
  }
  for (const k of DEADLINE_BUCKETS) {
    groups[k].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  }
  return groups;
}
