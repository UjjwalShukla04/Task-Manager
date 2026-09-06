import api from "./axios";
import type {
  Task,
  Pagination,
  Priority,
  TaskStatus,
  TaskActivity,
} from "../types";

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: Priority;
  assignedToId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  assignedToId?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | "";
  priority?: Priority | "";
  search?: string;
  sortBy?: "dueDate" | "createdAt" | "priority";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TasksPage {
  tasks: Task[];
  pagination: Pagination;
}

export const getTasks = async (filters: TaskFilters = {}): Promise<TasksPage> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const res = await api.get<{ data: { tasks: Task[] }; pagination: Pagination }>(
    `/tasks?${params.toString()}`
  );
  return { tasks: res.data.data.tasks, pagination: res.data.pagination };
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const res = await api.post<{ data: { task: Task } }>("/tasks", data);
  return res.data.data.task;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskData
): Promise<Task> => {
  const res = await api.patch<{ data: { task: Task } }>(`/tasks/${id}`, data);
  return res.data.data.task;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const getTaskActivity = async (id: string): Promise<TaskActivity[]> => {
  const res = await api.get<{ data: { activity: TaskActivity[] } }>(
    `/tasks/${id}/activity`
  );
  return res.data.data.activity;
};
