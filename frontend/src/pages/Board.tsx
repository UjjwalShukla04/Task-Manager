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
import { STATUSES, type Task, type TaskStatus } from "../types";
import { statusMeta } from "../lib/taskMeta";
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
        "touch-none rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab"
      )}
      aria-roledescription="Draggable task. Press space to pick up, arrow keys to move, space to drop."
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
  const meta = statusMeta[status];

  return (
    <section
      aria-label={meta.label}
      className="flex min-w-0 flex-col rounded-2xl bg-fg/2.5 p-2.5 dark:bg-white/2"
    >
      <header className="flex items-center gap-2 px-2 pb-2.5 pt-1">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="text-[13px] font-semibold text-fg">{meta.label}</h2>
        <span className="rounded-full bg-fg/6 px-1.5 text-[11px] font-medium text-muted dark:bg-white/8">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors",
          isOver && "bg-accent/7 ring-2 ring-inset ring-accent/30"
        )}
      >
        {loading ? (
          <TaskCardSkeleton />
        ) : tasks.length === 0 ? (
          <p className="px-2 py-10 text-center text-xs text-faint">
            Drop tasks here
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Board</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            Drag cards between columns to update status.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden /> New task
        </Button>
      </div>

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
              onEdit={(t) => {
                setEditing(t);
                setModalOpen(true);
              }}
              onDelete={setToDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-72 rotate-1 opacity-95 shadow-lg">
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
