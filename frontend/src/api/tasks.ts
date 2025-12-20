import api from "./axios";
import type { Task } from "../types";

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedToId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  status?: "ToDo" | "InProgress" | "Review" | "Completed";
  assignedToId?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const getTasks = async (filters?: TaskFilters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const response = await api.get<{ data: { tasks: Task[] } }>(
    `/tasks?${params.toString()}`
  );
  return response.data.data.tasks;
};

export const createTask = async (data: CreateTaskData) => {
  const response = await api.post<{ data: { task: Task } }>("/tasks", data);
  return response.data.data.task;
};

export const updateTask = async (id: string, data: UpdateTaskData) => {
  const response = await api.patch<{ data: { task: Task } }>(
    `/tasks/${id}`,
    data
  );
  return response.data.data.task;
};

export const deleteTask = async (id: string) => {
  await api.delete(`/tasks/${id}`);
};
