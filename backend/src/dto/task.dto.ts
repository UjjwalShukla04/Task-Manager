import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().default(''),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedToId: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z.enum(['ToDo', 'InProgress', 'Review', 'Completed']).optional(),
});

export const TaskFilterSchema = z.object({
  status: z.enum(['ToDo', 'InProgress', 'Review', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  sortBy: z.enum(['dueDate']).optional(),
  order: z.enum(['asc', 'desc']).default('asc').optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFilterInput = z.infer<typeof TaskFilterSchema>;
