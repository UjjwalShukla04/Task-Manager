import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { RegisterInput } from "../dto/auth.dto";

/** Fields that are safe to return to clients. Never includes `password`. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export class UserRepository {
  /** Returns the created user without the password hash. */
  async create(data: RegisterInput & { password: string }) {
    return prisma.user.create({ data, select: publicUserSelect });
  }

  /** Includes the password hash — for auth checks only, never return directly. */
  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: publicUserSelect });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  }

  async findAll() {
    return prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { name: "asc" },
    });
  }
}
