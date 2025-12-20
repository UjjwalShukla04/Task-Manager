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
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "ToDo" | "InProgress" | "Review" | "Completed";
  creatorId: string;
  assignedToId?: string;
  creator: User;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
