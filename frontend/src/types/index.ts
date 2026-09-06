export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const STATUSES = ["ToDo", "InProgress", "Review", "Completed"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type TaskStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  ToDo: "To Do",
  InProgress: "In Progress",
  Review: "Review",
  Completed: "Completed",
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  creatorId: string;
  assignedToId?: string | null;
  creator: User;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | "Created"
  | "StatusChanged"
  | "Reassigned"
  | "Updated";

export interface TaskActivity {
  id: string;
  taskId: string;
  actorId: string;
  type: ActivityType;
  detail: Record<string, unknown> | null;
  createdAt: string;
  actor: User;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
