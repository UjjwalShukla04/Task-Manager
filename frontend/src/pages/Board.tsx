import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { isPast, isToday } from "date-fns";
import { Plus, AlertTriangle } from "lucide-react";
import { useTasks, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { useTaskComposer } from "../context/TaskComposerContext";
import { STATUSES, type Task, type TaskStatus } from "../types";
import { statusMeta } from "../lib/taskMeta";
import { TaskCard } from "../components/TaskCard";
import { QuickAdd } from "../components/QuickAdd";
import { EmptyState } from "../components/EmptyState";
import { TaskCardSkeleton } from "../components/ui/Skeleton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

function DraggableCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "animate-in rounded-card",
        isDragging && "opacity-40"
      )}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        showStatus={false}
        showTimestamp={false}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function Column({
  status,
  tasks,
  loading,
  onEdit,
  onDelete,
}: {
  status: TaskStatus;
  tasks: Task[];
  loading: boolean;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = statusMeta[status];

  return (
    <section
      aria-label={meta.label}
      className="flex min-w-0 flex-col rounded-2xl bg-fg/2.5 p-2.5 dark:bg-white/2"
    >
      <header className="flex items-center gap-2 px-2 pb-2.5 pt-1">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="text-[14px] font-semibold text-fg">{meta.label}</h2>
        <span className="rounded-full bg-fg/6 px-1.5 text-[12px] font-medium text-muted dark:bg-white/8">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors",
          isOver && "bg-accent/8 ring-2 ring-inset ring-accent/30"
        )}
      >
        {loading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : (
          tasks.map((task) => (
            <DraggableCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
        {!loading && <QuickAdd status={status} />}
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-xl border border-line bg-elevated px-3.5 py-2 shadow-xs">
      <p
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "danger" && value > 0 ? "text-rose-500" : "text-fg"
        )}
      >
        {value}
      </p>
      <p className="text-[12px] font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
    </div>
  );
}

export default function BoardPage() {
  const { data, isLoading, isError, refetch } = useTasks({
    limit: 100,
    sortBy: "createdAt",
    order: "desc",
  });
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { openCreate, openEdit } = useTaskComposer();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Task | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const byStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      ToDo: [],
      InProgress: [],
      Review: [],
      Completed: [],
    };
    for (const t of tasks) groups[t.status].push(t);
    return groups;
  }, [tasks]);

  const overdue = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.status === "Completed" || !t.dueDate) return false;
        const d = new Date(t.dueDate);
        return isPast(d) && !isToday(d);
      }).length,
    [tasks]
  );

  const activeTask = tasks.find((t) => t.id === activeId);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const target = over.id as TaskStatus;
    if (!task || task.status === target || !STATUSES.includes(target)) return;
    updateMutation.mutate({ id: task.id, data: { status: target } });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Board</h1>
          <p className="mt-0.5 max-w-3xl text-[14px] leading-relaxed text-muted">
            Each column is a stage of work — To&nbsp;Do → In&nbsp;Progress →
            Review → Completed. Drag a card to move that task to the next
            stage: the change is saved instantly, pushed live to the task's
            creator and assignee, and recorded in its activity log. The
            counters above show where your work stands right now.{" "}
            <span className="whitespace-nowrap">
              Press{" "}
              <kbd className="rounded border border-line px-1 text-[12px]">
                ⌘K
              </kbd>{" "}
              for quick actions.
            </span>
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4" aria-hidden /> New task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatChip label="Total" value={tasks.length} />
        <StatChip label="In progress" value={byStatus.InProgress.length} />
        <StatChip label="Completed" value={byStatus.Completed.length} />
        <StatChip label="Overdue" value={overdue} tone="danger" />
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="mx-auto mb-2 h-5 w-5" aria-hidden />
          <p className="mb-3 text-sm">Couldn’t load the board.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !isLoading && tasks.length === 0 ? (
        <EmptyState
          title="Your board is empty"
          message="Create your first task and it’ll show up in To Do."
          action={
            <Button onClick={() => openCreate()}>
              <Plus className="h-4 w-4" aria-hidden /> Create task
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={byStatus[status]}
                loading={isLoading}
                onEdit={openEdit}
                onDelete={setToDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rotate-1 opacity-95 shadow-lg">
                <TaskCard
                  task={activeTask}
                  showStatus={false}
                  showTimestamp={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete task"
        message={`“${toDelete?.title}” will be permanently removed.`}
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onCancel={() => setToDelete(undefined)}
        onConfirm={() => {
          if (toDelete)
            deleteMutation.mutate(toDelete, {
              onSettled: () => setToDelete(undefined),
            });
        }}
      />
    </div>
  );
}
