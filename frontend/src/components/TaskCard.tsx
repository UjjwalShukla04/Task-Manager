import { format, isPast, isToday } from "date-fns";
import { Pencil, Trash2, CalendarClock, AlertTriangle } from "lucide-react";
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
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  showStatus = true,
  compact = false,
  className,
}: TaskCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === task.creatorId;
  const due = new Date(task.dueDate);
  const overdue = isPast(due) && !isToday(due) && task.status !== "Completed";
  const dueToday = isToday(due) && task.status !== "Completed";

  return (
    <article
      className={cn(
        "group card-hover relative overflow-hidden rounded-card border border-line bg-elevated shadow-xs",
        className
      )}
    >
      {/* priority accent strip */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          priorityMeta[task.priority].dot
        )}
        aria-hidden
      />

      <div className="p-4 pl-[1.125rem]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3
            className="line-clamp-2 text-sm font-medium leading-snug text-fg"
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

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-[13px]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              overdue
                ? "font-medium text-rose-600 dark:text-rose-400"
                : dueToday
                  ? "font-medium text-amber-600 dark:text-amber-400"
                  : "text-muted"
            )}
          >
            {overdue ? (
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>
              {overdue ? "Overdue · " : dueToday ? "Today · " : ""}
              {format(due, "MMM d")}
            </span>
          </span>

          <div className="flex items-center gap-1">
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
              <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
      </div>
    </article>
  );
}
