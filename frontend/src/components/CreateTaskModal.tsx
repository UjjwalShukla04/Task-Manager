import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getAllUsers } from "../api/auth";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { PRIORITIES, type Task } from "../types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(PRIORITIES),
  assignedToId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

/** Turn a "yyyy-MM-dd" field value into an end-of-day ISO string (tz-safe). */
const toDueIso = (value: string) => new Date(`${value}T23:59:59`).toISOString();

export function CreateTaskModal({ isOpen, onClose, taskToEdit }: Props) {
  const isEdit = !!taskToEdit;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isOpen,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "Medium" },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description,
        dueDate: format(new Date(taskToEdit.dueDate), "yyyy-MM-dd"),
        priority: taskToEdit.priority,
        assignedToId: taskToEdit.assignedToId ?? "",
      });
    } else {
      reset({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedToId: "",
      });
    }
  }, [taskToEdit, isOpen, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      description: data.description ?? "",
      dueDate: toDueIso(data.dueDate),
      priority: data.priority,
      assignedToId: data.assignedToId || undefined,
    };
    if (isEdit && taskToEdit) {
      updateMutation.mutate(
        { id: taskToEdit.id, data: { ...payload, assignedToId: data.assignedToId || null } },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit task" : "Create task"}
      description={isEdit ? undefined : "Add a task and optionally assign it."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" error={errors.title?.message} {...register("title")} />

        <div>
          <label
            htmlFor="task-description"
            className="mb-1 block text-sm font-medium text-fg"
          >
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            {...register("description")}
          />
        </div>

        <Input
          label="Due date"
          type="date"
          error={errors.dueDate?.message}
          {...register("dueDate")}
        />

        <Select label="Priority" {...register("priority")}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        <Select label="Assign to" {...register("assignedToId")}>
          <option value="">Unassigned</option>
          {users?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
