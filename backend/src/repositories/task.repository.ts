import prisma from "../config/prisma";
import { Prisma, ActivityType } from "@prisma/client";
import { publicUserSelect } from "./user.repository";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "../dto/task.dto";

const taskInclude = {
  assignedTo: { select: publicUserSelect },
  creator: { select: publicUserSelect },
} satisfies Prisma.TaskInclude;

export interface ActivityEntry {
  taskId: string;
  actorId: string;
  type: ActivityType;
  detail?: Prisma.InputJsonValue;
}

export class TaskRepository {
  async create(data: CreateTaskInput & { creatorId: string }) {
    return prisma.task.create({ data, include: taskInclude });
  }

  async findById(id: string) {
    return prisma.task.findUnique({ where: { id }, include: taskInclude });
  }

  async findAll(filters: TaskFilterInput, userId: string) {
    const where: Prisma.TaskWhereInput = {
      OR: [{ creatorId: userId }, { assignedToId: userId }],
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.search
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: filters.search, mode: "insensitive" } },
                  {
                    description: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [filters.sortBy]: filters.order,
    };

    const skip = (filters.page - 1) * filters.limit;

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy,
        include: taskInclude,
        skip,
        take: filters.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    };
  }

  async update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({ where: { id }, data, include: taskInclude });
  }

  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  async addActivity(entries: ActivityEntry | ActivityEntry[]) {
    const rows = Array.isArray(entries) ? entries : [entries];
    if (rows.length === 0) return;
    await prisma.taskActivity.createMany({
      data: rows.map((r) => ({
        taskId: r.taskId,
        actorId: r.actorId,
        type: r.type,
        detail: r.detail,
      })),
    });
  }

  async findActivity(taskId: string) {
    return prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: publicUserSelect } },
    });
  }
}
