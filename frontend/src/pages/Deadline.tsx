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
import { Plus, CalendarClock } from "lucide-react";
import { useTasks, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { useTaskComposer } from "../context/TaskComposerContext";
import type { Task } from "../types";
import {
  DEADLINE_BUCKETS,
  bucketMeta,
  bucketChange,
  quickAddDate,
  groupByBucket,
  type DeadlineBucket,
} from "../lib/deadline";
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
  onStatusChange,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: Task["status"]) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={cn("animate-in rounded-card", isDragging && "opacity-40")}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        showTimestamp={false}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function Column({
  bucket,
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  bucket: DeadlineBucket;
  tasks: Task[];
  loading: boolean;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (t: Task, s: Task["status"]) => void;
}) {
  const meta = bucketMeta[bucket];
  const { setNodeRef, isOver } = useDroppable({
    id: bucket,
    disabled: !meta.droppable,
  });

  return (
    <section
      aria-label={meta.label}
      className="flex min-w-56 flex-1 flex-col rounded-2xl bg-fg/2.5 p-2.5 dark:bg-white/2"
    >
      <header className="flex items-center gap-2 px-2 pb-2.5 pt-1">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="truncate text-[14px] font-semibold text-fg">
          {meta.label}
        </h2>
        <span className="ml-auto rounded-full bg-fg/6 px-1.5 text-[12px] font-medium text-muted dark:bg-white/8">
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
          <TaskCardSkeleton />
        ) : tasks.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-faint">
            {meta.droppable ? "Drop tasks here" : "Nothing here"}
          </p>
        ) : (
          tasks.map((t) => (
            <DraggableCard
              key={t.id}
              task={t}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
        {!loading && meta.quickAdd && (
          <QuickAdd dueDateIso={quickAddDate(bucket)} label="Quick task" />
        )}
      </div>
    </section>
  );
}

export default function DeadlinePage() {
  const { data, isLoading, isError, refetch } = useTasks({
    limit: 100,
    sortBy: "dueDate",
    order: "asc",
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
  const groups = useMemo(() => groupByBucket(tasks), [tasks]);
  const activeTask = tasks.find((t) => t.id === activeId);

  const changeStatus = (t: Task, status: Task["status"]) =>
    updateMutation.mutate({ id: t.id, data: { status } });

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const target = over.id as DeadlineBucket;
    if (!task || !bucketMeta[target]?.droppable) return;
    const change = bucketChange(target);
    if (Object.keys(change).length === 0) return;
    updateMutation.mutate({ id: task.id, data: change });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Deadline</h1>
          <p className="mt-0.5 text-[14px] text-muted">
            Grouped by due date — drag a card to reschedule, clear its
            deadline, or complete it.
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4" aria-hidden /> New task
        </Button>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <p className="mb-3 text-sm">Couldn’t load tasks.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !isLoading && tasks.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          message="Create a task and it’ll land in a deadline bucket."
          icon={<CalendarClock className="h-6 w-6" aria-hidden />}
          action={
            <Button onClick={() => openCreate()}>
              <Plus className="h-4 w-4" aria-hidden /> New task
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]">
            <div className="flex gap-3">
              {DEADLINE_BUCKETS.map((b) => (
                <Column
                  key={b}
                  bucket={b}
                  tasks={groups[b]}
                  loading={isLoading}
                  onEdit={openEdit}
                  onDelete={setToDelete}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rotate-1 opacity-95 shadow-lg">
                <TaskCard task={activeTask} showTimestamp={false} />
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
