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
import { Plus } from "lucide-react";
import { useTasks, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from "../types";
import { TaskCard } from "../components/TaskCard";
import { CreateTaskModal } from "../components/CreateTaskModal";
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
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
      aria-roledescription="Draggable task. Press space or enter to pick up, arrow keys to move between columns."
    >
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} showStatus={false} />
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
  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABELS[status]}
      className={cn(
        "flex min-h-[12rem] flex-col gap-3 rounded-2xl border border-border bg-surface-muted/60 p-3 transition-colors",
        isOver && "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30"
      )}
    >
      <header className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-fg">
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-fg-muted">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-col gap-3">
        {loading ? (
          <TaskCardSkeleton />
        ) : tasks.length === 0 ? (
          <p className="px-1 py-8 text-center text-xs text-fg-muted">
            Nothing here
          </p>
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
      </div>
    </section>
  );
}

export default function BoardPage() {
  const { data, isLoading } = useTasks({
    limit: 100,
    sortBy: "createdAt",
    order: "desc",
  });
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
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

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">Board</h1>
          <p className="text-sm text-fg-muted">
            Drag cards between columns to update status.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden /> New task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={byStatus[status]}
              loading={isLoading}
              onEdit={(t) => {
                setEditing(t);
                setModalOpen(true);
              }}
              onDelete={setToDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rotate-2">
              <TaskCard task={activeTask} showStatus={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        taskToEdit={editing}
      />
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
            deleteMutation.mutate(toDelete.id, {
              onSettled: () => setToDelete(undefined),
            });
        }}
      />
    </div>
  );
}
