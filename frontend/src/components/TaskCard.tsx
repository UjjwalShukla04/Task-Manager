import { format, isPast, isToday } from "date-fns";
import { Pencil, Trash2, CalendarClock, AlertTriangle } from "lucide-react";
import type { Task } from "../types";
import { PriorityBadge, StatusBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";
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

  return (
    <article
      className={cn(
        "rounded-xl border bg-surface-raised p-4 shadow-sm transition-shadow hover:shadow-md",
        overdue ? "border-red-300 dark:border-red-800" : "border-border",
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-medium text-fg" title={task.title}>
          {task.title}
        </h3>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <PriorityBadge priority={task.priority} />
          {showStatus && <StatusBadge status={task.status} />}
        </div>
      </div>

      {!compact && task.description && (
        <p
          className="mb-3 line-clamp-2 text-sm text-fg-muted"
          title={task.description}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            overdue ? "font-medium text-red-600 dark:text-red-400" : "text-fg-muted"
          )}
        >
          {overdue ? (
            <AlertTriangle className="h-4 w-4" aria-hidden />
          ) : (
            <CalendarClock className="h-4 w-4" aria-hidden />
          )}
          <span>
            {overdue ? "Overdue · " : ""}
            {format(due, "MMM d, yyyy")}
          </span>
        </span>

        {task.assignedTo && (
          <span
            className="inline-flex items-center gap-1.5 text-fg-muted"
            title={`Assigned to ${task.assignedTo.name}`}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
              aria-hidden
            >
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-xs sm:inline">
              {task.assignedTo.name}
            </span>
          </span>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
          )}
          {onDelete && isCreator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task)}
              aria-label={`Delete ${task.title}`}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
