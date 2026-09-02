import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
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

export const tasksKey = (filters: TaskFilters) =>
  ["tasks", filters] as const;

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: tasksKey(filters),
    queryFn: () => getTasks(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * Subscribe to realtime task events once (mount in a layout).
 * Invalidates every `["tasks", …]` query so filtered/paginated views stay
 * correct instead of trying to surgically patch each cache entry.
 */
export function useTaskRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    const invalidate = () =>
      qc.invalidateQueries({ queryKey: ["tasks"] });

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
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to create task"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    // Optimistic: patch the task in every cached list immediately.
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const snapshots = qc.getQueriesData<TasksPage>({ queryKey: ["tasks"] });
      snapshots.forEach(([key, page]) => {
        if (!page) return;
        qc.setQueryData<TasksPage>(key, {
          ...page,
          tasks: page.tasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        });
      });
      return { snapshots };
    },
    onError: (e: any, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, page]) => qc.setQueryData(key, page));
      toast.error(e?.response?.data?.message || "Update failed");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const snapshots = qc.getQueriesData<TasksPage>({ queryKey: ["tasks"] });
      snapshots.forEach(([key, page]) => {
        if (!page) return;
        qc.setQueryData<TasksPage>(key, {
          ...page,
          tasks: page.tasks.filter((t) => t.id !== id),
        });
      });
      return { snapshots };
    },
    onError: (e: any, _id, ctx) => {
      ctx?.snapshots.forEach(([key, page]) => qc.setQueryData(key, page));
      toast.error(e?.response?.data?.message || "Delete failed");
    },
    onSuccess: () => toast.success("Task deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
