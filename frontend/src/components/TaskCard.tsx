import type { HTMLAttributes } from "react";
import { format, isPast, isToday, formatDistanceToNowStrict } from "date-fns";

/** "just now" for the first minute, otherwise "3 minutes ago". */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 45_000) return "just now";
  return `${formatDistanceToNowStrict(new Date(iso))} ago`;
}
import {
  Pencil,
  Trash2,
  CalendarClock,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import type { Task } from "../types";
import { PriorityBadge, StatusBadge } from "./ui/Badge";
import { Avatar } from "./ui/Avatar";
import { cn } from "../utils/cn";
import { priorityMeta } from "../lib/taskMeta";
import { useAuth } from "../context/AuthContext";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showStatus?: boolean;
  compact?: boolean;
  className?: string;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  showStatus = true,
  compact = false,
  className,
  dragHandleProps,
}: TaskCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === task.creatorId;
  const due = new Date(task.dueDate);
  const overdue = isPast(due) && !isToday(due) && task.status !== "Completed";
  const dueToday = isToday(due) && task.status !== "Completed";

  return (
    <article
      className={cn(
        "group card-hover relative overflow-hidden rounded-card border border-line bg-elevated shadow-sm hover:border-line-strong",
        className
      )}
    >
      <span
        className={cn(
          "absolute inset-y-2 left-0 w-1 rounded-r-full",
          priorityMeta[task.priority].dot
        )}
        aria-hidden
      />

      <div className="p-3.5 pl-4">
        <div className="mb-2 flex items-start gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              aria-label="Drag task"
              className="-ml-1 mt-0.5 cursor-grab touch-none rounded text-faint opacity-0 transition-opacity focus:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" aria-hidden />
            </button>
          )}
          <h3
            className="line-clamp-2 flex-1 text-sm font-medium leading-snug text-fg"
            title={task.title}
          >
            {task.title}
          </h3>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <PriorityBadge priority={task.priority} />
            {showStatus && <StatusBadge status={task.status} />}
          </div>
        </div>

        {!compact && task.description && (
          <p
            className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted"
            title={task.description}
          >
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[12px] font-medium",
              overdue
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : dueToday
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  : "text-muted"
            )}
          >
            {overdue ? (
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            )}
            {overdue ? "Overdue" : dueToday ? "Today" : format(due, "MMM d")}
          </span>

          <div className="flex items-center gap-1.5">
            {task.assignedTo ? (
              <Avatar
                name={task.assignedTo.name}
                id={task.assignedTo.id}
                size="sm"
              />
            ) : (
              <span className="text-xs text-faint">Unassigned</span>
            )}

            {(onEdit || (onDelete && isCreator)) && (
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    aria-label={`Edit ${task.title}`}
                    className="rounded-md p-1.5 text-faint transition-colors hover:bg-fg/6 hover:text-fg dark:hover:bg-white/6"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
                {onDelete && isCreator && (
                  <button
                    onClick={() => onDelete(task)}
                    aria-label={`Delete ${task.title}`}
                    className="rounded-md p-1.5 text-faint transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {!compact && (
          <p className="mt-2 text-[11px] text-faint">
            Updated {relativeTime(task.updatedAt)}
          </p>
        )}
      </div>
    </article>
  );
}
