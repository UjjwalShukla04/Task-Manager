import { z } from "zod";

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const STATUSES = ["ToDo", "InProgress", "Review", "Completed"] as const;

/** Parses a string/Date into a Date; used as a nullish field below. */
const DueDateValue = z
  .union([z.string(), z.date()])
  .transform((val, ctx) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid due date" });
      return z.NEVER;
    }
    return d;
  });

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title too long"),
  // Optional; the DB column defaults to "" when omitted.
  description: z.string().trim().max(5000).optional(),
  // Optional / nullable — a task can have no deadline.
  dueDate: DueDateValue.nullish(),
  priority: z.enum(PRIORITIES),
  assignedToId: z.string().uuid().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial()
  .extend({
    status: z.enum(STATUSES).optional(),
    assignedToId: z.string().uuid().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "No fields to update",
  });

export const TaskFilterSchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().trim().max(120).optional(),
  sortBy: z.enum(["dueDate", "createdAt", "priority"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFilterInput = z.infer<typeof TaskFilterSchema>;
