import type { HTMLAttributes, MouseEvent } from "react";
import { format, isPast, isToday, formatDistanceToNowStrict } from "date-fns";
import {
  Pencil,
  Trash2,
  CalendarClock,
  AlertTriangle,
  GripVertical,
  Flag,
  ChevronRight,
} from "lucide-react";
import {
  STATUSES,
  STATUS_LABELS,
  type Task,
  type TaskStatus,
} from "../types";
import { StatusBadge } from "./ui/Badge";
import { Avatar } from "./ui/Avatar";
import { cn } from "../utils/cn";
import { priorityMeta } from "../lib/taskMeta";
import { useAuth } from "../context/AuthContext";

/** "just now" for the first minute, otherwise "3 minutes ago". */
function relativeTime(iso: string): string {
  if (Date.now() - new Date(iso).getTime() < 45_000) return "just now";
  return `${formatDistanceToNowStrict(new Date(iso))} ago`;
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  showStatus?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
  className?: string;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  showStatus = true,
  showTimestamp = true,
  compact = false,
  className,
  dragHandleProps,
}: TaskCardProps) {
  const { user } = useAuth();
  const isCreator = user?.id === task.creatorId;
  const isAssignee = user?.id === task.assignedToId;
  const due = new Date(task.dueDate);
  const overdue = isPast(due) && !isToday(due) && task.status !== "Completed";
  const dueToday = isToday(due) && task.status !== "Completed";
  const done = task.status === "Completed";
  const pr = priorityMeta[task.priority];

  // Only the creator edits/deletes task details. The assignee can move the
  // task through statuses (matching the backend permission model).
  const canEdit = isCreator && !!onEdit;
  const canDelete = isCreator && !!onDelete;
  const canChangeStatus = (isCreator || isAssignee) && !!onStatusChange;

  const cardClickable = canEdit && !dragHandleProps;
  const handleCardClick = (e: MouseEvent) => {
    if (!cardClickable) return;
    if ((e.target as HTMLElement).closest("button,a,select")) return;
    onEdit!(task);
  };
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        "group card-hover relative overflow-hidden rounded-xl border bg-elevated shadow-sm transition-colors",
        overdue
          ? "border-rose-300/70 dark:border-rose-900/70"
          : "border-line hover:border-line-strong",
        cardClickable && "cursor-pointer",
        className
      )}
    >
      {/* priority rail */}
      <span
        className={cn(
          "absolute inset-y-3 left-0 w-1 rounded-r-full",
          overdue ? "bg-rose-500" : pr.dot
        )}
        aria-hidden
      />

      {/* hover action bar (creator only) */}
      {(canEdit || canDelete) && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-lg border border-line bg-elevated/90 p-0.5 opacity-0 shadow-sm backdrop-blur transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {canEdit && (
            <button
              onClick={(e) => {
                stop(e);
                onEdit!(task);
              }}
              aria-label={`Edit ${task.title}`}
              className="rounded-md p-1.5 text-faint transition-colors hover:bg-fg/6 hover:text-fg dark:hover:bg-white/6"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                stop(e);
                onDelete!(task);
              }}
              aria-label={`Delete ${task.title}`}
              className="rounded-md p-1.5 text-faint transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      )}

      {/* drag handle */}
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          onClick={stop}
          aria-label="Drag task"
          className="absolute left-0.5 top-3 z-10 cursor-grab touch-none rounded p-0.5 text-faint opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      )}

      <div className="p-4 pl-5.5">
        <h3
          className={cn(
            "pr-14 text-[15px] font-semibold leading-snug",
            done ? "text-muted line-through" : "text-fg",
            "line-clamp-2"
          )}
          title={task.title}
        >
          {task.title}
        </h3>

        {!compact && task.description && (
          <p
            className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted"
            title={task.description}
          >
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium",
              pr.className
            )}
          >
            <Flag className="h-3 w-3" aria-hidden />
            {task.priority}
          </span>

          {showStatus &&
            (canChangeStatus ? (
              <select
                value={task.status}
                onClick={stop}
                onChange={(e) =>
                  onStatusChange!(task, e.target.value as TaskStatus)
                }
                aria-label={`Status of ${task.title}`}
                className="h-7 cursor-pointer rounded-md border border-line bg-surface px-1.5 text-[12px] font-medium text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={task.status} />
            ))}

          <span className="flex-1" />

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium",
              overdue
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : dueToday
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  : "text-muted"
            )}
          >
            {overdue ? (
              <AlertTriangle className="h-3 w-3" aria-hidden />
            ) : (
              <CalendarClock className="h-3 w-3" aria-hidden />
            )}
            {overdue ? "Overdue" : dueToday ? "Today" : format(due, "MMM d")}
          </span>

          {/* assigned by → assigned to */}
          <span className="flex items-center gap-0.5">
            <Avatar
              name={task.creator.name}
              id={task.creator.id}
              size="xs"
              className="opacity-70"
            />
            {task.assignedToId !== task.creatorId && (
              <>
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-faint"
                  aria-hidden
                />
                {task.assignedTo ? (
                  <Avatar
                    name={task.assignedTo.name}
                    id={task.assignedTo.id}
                    size="sm"
                  />
                ) : (
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-line-strong text-faint"
                    title="Unassigned"
                    aria-label="Unassigned"
                  >
                    <span className="text-[14px] leading-none">+</span>
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-faint">
          By {task.creator.name}
          {task.assignedTo && task.assignedToId !== task.creatorId
            ? ` · assigned to ${task.assignedTo.name}`
            : ""}
          {!compact && showTimestamp
            ? ` · updated ${relativeTime(task.updatedAt)}`
            : ""}
        </p>
      </div>
    </article>
  );
}
