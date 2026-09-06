import { ActivityType } from "@prisma/client";
import { TaskRepository, ActivityEntry } from "../repositories/task.repository";
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

const DETAIL_FIELDS = ["title", "description", "dueDate", "priority"] as const;

export class TaskService {
  async createTask(userId: string, data: CreateTaskInput) {
    if (data.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) throw new AppError("Assigned user not found", 404);
    }

    const task = await taskRepository.create({ ...data, creatorId: userId });
    await taskRepository.addActivity({
      taskId: task.id,
      actorId: userId,
      type: ActivityType.Created,
      detail: task.assignedTo ? { assignedTo: task.assignedTo.name } : undefined,
    });

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

  async getActivity(userId: string, taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (task.creatorId !== userId && task.assignedToId !== userId) {
      throw new AppError("Not authorized to view this task", 403);
    }
    return taskRepository.findActivity(taskId);
  }

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError("Task not found", 404);

    const isCreator = task.creatorId === userId;
    const isAssignee = task.assignedToId === userId;
    if (!isCreator && !isAssignee) {
      throw new AppError("Not authorized to update this task", 403);
    }

    // The assignee may only move the task through statuses; every other
    // field (title, description, due date, priority, assignee) is the
    // creator's to change.
    if (!isCreator) {
      const touched = Object.keys(data).filter(
        (k) => data[k as keyof UpdateTaskInput] !== undefined
      );
      const illegal = touched.filter((k) => k !== "status");
      if (illegal.length > 0) {
        throw new AppError("Assignees can only change the task status", 403);
      }
    }

    const reassigning =
      "assignedToId" in data && data.assignedToId !== task.assignedToId;
    let newAssigneeName: string | null = null;
    if (reassigning && data.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) throw new AppError("Assigned user not found", 404);
      newAssigneeName = assignee.name ?? assignee.email;
    }

    const updated = await taskRepository.update(taskId, data);

    // --- accountability: record who changed what ---
    const activity: ActivityEntry[] = [];
    if (data.status && data.status !== task.status) {
      activity.push({
        taskId,
        actorId: userId,
        type: ActivityType.StatusChanged,
        detail: { from: task.status, to: data.status },
      });
    }
    if (reassigning) {
      activity.push({
        taskId,
        actorId: userId,
        type: ActivityType.Reassigned,
        detail: {
          from: task.assignedTo?.name ?? null,
          to: data.assignedToId ? newAssigneeName : null,
        },
      });
    }
    const changedFields = DETAIL_FIELDS.filter(
      (f) => data[f] !== undefined && String(data[f]) !== String((task as any)[f])
    );
    if (changedFields.length > 0) {
      activity.push({
        taskId,
        actorId: userId,
        type: ActivityType.Updated,
        detail: { fields: changedFields },
      });
    }
    await taskRepository.addActivity(activity);

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

    emitToUsers([task.creatorId, task.assignedToId], "task_deleted", {
      id: taskId,
    });
    logger.info({ taskId, userId }, "task deleted");
  }
}
