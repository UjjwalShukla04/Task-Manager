import prisma from "../config/prisma";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "../dto/task.dto";
import { Prisma } from "@prisma/client";

export class TaskRepository {
  async create(data: CreateTaskInput & { creatorId: string }) {
    return prisma.task.create({
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(filters: TaskFilterInput, userId: string) {
    const where: any = {
      OR: [{ creatorId: userId }, { assignedToId: userId }],
    };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const orderBy: any = {};
    if (filters.sortBy === "dueDate") {
      orderBy.dueDate = filters.order || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.task.findMany({
      where,
      orderBy,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }
}
