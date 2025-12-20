import { TaskRepository } from "../repositories/task.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "../dto/task.dto";
import { getIO } from "../utils/socket";
import { AppError } from "../utils/AppError";

const taskRepository = new TaskRepository();
const userRepository = new UserRepository();

export class TaskService {
  async createTask(userId: string, data: CreateTaskInput) {
    if (data.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) {
        throw new AppError("Assigned user not found", 404);
      }
    }

    const task = await taskRepository.create({
      ...data,
      creatorId: userId,
    });

    try {
      const io = getIO();
      io.to(userId).emit("task_created", task);
      if (task.assignedToId && task.assignedToId !== userId) {
        io.to(task.assignedToId).emit("task_created", task);
        io.to(task.assignedToId).emit("task_assigned", task);
      }
    } catch (error) {
      console.error("Socket emit failed:", error);
    }

    return task;
  }

  async getTasks(userId: string, filters: TaskFilterInput) {
    return taskRepository.findAll(filters, userId);
  }

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);

    if (task.creatorId !== userId && task.assignedToId !== userId) {
      throw new AppError("Not authorized to update this task", 403);
    }

    const updatedTask = await taskRepository.update(taskId, data);

    try {
      const io = getIO();
      // Notify creator
      io.to(updatedTask.creatorId).emit("task_updated", updatedTask);

      // Notify assignee
      if (updatedTask.assignedToId) {
        if (updatedTask.assignedToId !== updatedTask.creatorId) {
          io.to(updatedTask.assignedToId).emit("task_updated", updatedTask);
        }

        if (task.assignedToId !== updatedTask.assignedToId) {
          io.to(updatedTask.assignedToId).emit("task_assigned", updatedTask);
        }
      }

      // Notify old assignee if different
      if (
        task.assignedToId &&
        task.assignedToId !== updatedTask.assignedToId &&
        task.assignedToId !== updatedTask.creatorId
      ) {
        io.to(task.assignedToId).emit("task_updated", updatedTask);
      }
    } catch (error) {
      console.error("Socket emit failed:", error);
    }

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);

    if (task.creatorId !== userId) {
      throw new AppError("Only creator can delete task", 403);
    }

    await taskRepository.delete(taskId);

    try {
      const io = getIO();
      io.to(task.creatorId).emit("task_deleted", taskId);
      if (task.assignedToId && task.assignedToId !== task.creatorId) {
        io.to(task.assignedToId).emit("task_deleted", taskId);
      }
    } catch (error) {
      console.error("Socket emit failed:", error);
    }
  }
}
