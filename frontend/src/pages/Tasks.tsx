import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useTasks, useDeleteTask } from "../hooks/useTasks";
import type { TaskFilters } from "../api/tasks";
import { PRIORITIES, STATUSES, STATUS_LABELS, type Task } from "../types";
import { TaskCard } from "../components/TaskCard";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { EmptyState } from "../components/EmptyState";
import { TaskGridSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

const PAGE_SIZE = 12;

export default function TasksPage() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const search = useDebouncedValue(searchInput, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [toDelete, setToDelete] = useState<Task | undefined>();
  const deleteMutation = useDeleteTask();

  const page = Number(params.get("page") ?? "1");
  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";
  const sortBy = (params.get("sortBy") ?? "createdAt") as
    | "createdAt"
    | "dueDate"
    | "priority";

  const filters: TaskFilters = useMemo(
    () => ({
      status: status as TaskFilters["status"],
      priority: priority as TaskFilters["priority"],
      search: search || undefined,
      sortBy,
      order: sortBy === "dueDate" ? "asc" : "desc",
      page,
      limit: PAGE_SIZE,
    }),
    [status, priority, search, sortBy, page]
  );

  const { data, isLoading, isFetching, isError, refetch } = useTasks(filters);

  const setParam = (key: string, value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  };

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">Tasks</h1>
          <p className="text-sm text-fg-muted">
            {pagination ? `${pagination.total} total` : " "}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden /> New task
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted"
              aria-hidden
            />
            <Input
              label="Search"
              srOnlyLabel
              placeholder="Search tasks…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search tasks"
            />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setParam("priority", e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(e) => setParam("sortBy", e.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TaskGridSkeleton count={6} />
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="mb-3">Couldn’t load tasks.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match"
          message="Try clearing filters or create a new task to get started."
          action={
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden /> Create task
            </Button>
          }
        />
      ) : (
        <div
          className={isFetching ? "opacity-60 transition-opacity" : undefined}
          aria-busy={isFetching}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={setToDelete}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setParam("page", String(page - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-fg-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setParam("page", String(page + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

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
