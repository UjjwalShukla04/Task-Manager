import { TaskRepository } from "../repositories/task.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "../dto/task.dto";
import { emitToUsers } from "../utils/socket";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";

const taskRepository = new TaskRepository();
const userRepository = new UserRepository();

export class TaskService {
  async createTask(userId: string, data: CreateTaskInput) {
    if (data.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) throw new AppError("Assigned user not found", 404);
    }

    const task = await taskRepository.create({ ...data, creatorId: userId });

    emitToUsers([task.creatorId, task.assignedToId], "task_created", task);
    if (task.assignedToId && task.assignedToId !== userId) {
      emitToUsers([task.assignedToId], "task_assigned", task);
    }

    logger.info({ taskId: task.id, userId }, "task created");
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

    if (data.assignedToId && data.assignedToId !== task.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) throw new AppError("Assigned user not found", 404);
    }

    const updated = await taskRepository.update(taskId, data);

    // Notify current + previous participants so the task leaves/enters lists.
    emitToUsers(
      [updated.creatorId, updated.assignedToId, task.assignedToId],
      "task_updated",
      updated
    );
    if (
      updated.assignedToId &&
      updated.assignedToId !== task.assignedToId &&
      updated.assignedToId !== userId
    ) {
      emitToUsers([updated.assignedToId], "task_assigned", updated);
    }

    logger.info({ taskId, userId }, "task updated");
    return updated;
  }

  async deleteTask(userId: string, taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (task.creatorId !== userId) {
      throw new AppError("Only the creator can delete this task", 403);
    }

    await taskRepository.delete(taskId);

    emitToUsers(
      [task.creatorId, task.assignedToId],
      "task_deleted",
      { id: taskId }
    );
    logger.info({ taskId, userId }, "task deleted");
  }
}
