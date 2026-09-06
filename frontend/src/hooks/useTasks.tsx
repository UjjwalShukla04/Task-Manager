import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type QueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type TaskFilters,
  type TasksPage,
  type CreateTaskData,
  type UpdateTaskData,
} from "../api/tasks";
import type { Task } from "../types";
import { getSocket } from "../utils/socket";

export const tasksKey = (filters: TaskFilters) => ["tasks", filters] as const;

type Snapshot = [readonly unknown[], TasksPage | undefined][];

/** Apply a transform to every cached tasks list; return snapshots for rollback. */
function patchLists(
  qc: QueryClient,
  fn: (tasks: Task[]) => Task[]
): { snapshots: Snapshot } {
  const snapshots = qc.getQueriesData<TasksPage>({ queryKey: ["tasks"] });
  snapshots.forEach(([key, page]) => {
    if (!page) return;
    qc.setQueryData<TasksPage>(key, { ...page, tasks: fn(page.tasks) });
  });
  return { snapshots };
}

const rollback = (qc: QueryClient, ctx?: { snapshots: Snapshot }) =>
  ctx?.snapshots.forEach(([key, page]) => qc.setQueryData(key, page));

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.message || fallback;

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: tasksKey(filters),
    queryFn: () => getTasks(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * Subscribe to realtime task events once (mount in a layout). Invalidates every
 * `["tasks", …]` query so filtered/paginated views stay correct.
 */
export function useTaskRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task-activity"] });
    };

    const onCreated = (task: Task) => {
      invalidate();
      toast.success(`New task: ${task.title}`, { id: `c-${task.id}` });
    };
    const onAssigned = (task: Task) => {
      invalidate();
      toast(`Assigned to you: ${task.title}`, { id: `a-${task.id}`, icon: "📌" });
    };
    const onUpdated = (task: Task) => {
      invalidate();
      toast.success(`Updated: ${task.title}`, { id: `u-${task.id}` });
    };
    const onDeleted = (payload: { id: string }) => {
      invalidate();
      toast(`Task removed`, { id: `d-${payload.id}` });
    };

    socket.on("task_created", onCreated);
    socket.on("task_assigned", onAssigned);
    socket.on("task_updated", onUpdated);
    socket.on("task_deleted", onDeleted);
    return () => {
      socket.off("task_created", onCreated);
      socket.off("task_assigned", onAssigned);
      socket.off("task_updated", onUpdated);
      socket.off("task_deleted", onDeleted);
    };
  }, [qc]);
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
    },
    onError: (e) => toast.error(errMsg(e, "Failed to create task")),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      return patchLists(qc, (tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
    },
    onError: (e, _vars, ctx) => {
      rollback(qc, ctx);
      toast.error(errMsg(e, "Update failed"));
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task-activity", vars.id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const recreate = useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onMutate: async (task) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      return patchLists(qc, (tasks) => tasks.filter((t) => t.id !== task.id));
    },
    onError: (e, _task, ctx) => {
      rollback(qc, ctx);
      toast.error(errMsg(e, "Delete failed"));
    },
    onSuccess: (_res, task) => {
      toast(
        (t) => (
          <span className="flex items-center gap-3">
            Task deleted
            <button
              className="font-medium text-accent hover:underline"
              onClick={() => {
                toast.dismiss(t.id);
                recreate.mutate({
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate,
                  priority: task.priority,
                  assignedToId: task.assignedToId ?? undefined,
                });
              }}
            >
              Undo
            </button>
          </span>
        ),
        { duration: 5000 }
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return del;
}
