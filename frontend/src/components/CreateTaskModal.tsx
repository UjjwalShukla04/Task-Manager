import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "../api/tasks";
import { getAllUsers } from "../api/auth";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Task } from "../types";
import toast from "react-hot-toast";
import { useEffect } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  assignedToId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  taskToEdit,
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "Medium",
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isOpen,
  });

  useEffect(() => {
    if (taskToEdit) {
      setValue("title", taskToEdit.title);
      setValue("description", taskToEdit.description);
      setValue(
        "dueDate",
        new Date(taskToEdit.dueDate).toISOString().split("T")[0]
      );
      setValue("priority", taskToEdit.priority);
      setValue("assignedToId", taskToEdit.assignedToId || "");
    } else {
      reset({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedToId: "",
      });
    }
  }, [taskToEdit, setValue, reset, isOpen]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskFormData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update task");
    },
  });

  const onSubmit = (data: TaskFormData) => {
    const formattedData = {
      ...data,
      assignedToId: data.assignedToId || undefined,
    };
    if (taskToEdit) {
      updateMutation.mutate({ id: taskToEdit.id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create Task"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("description")}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
          {...register("dueDate")}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("priority")}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Assign To
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("assignedToId")}
          >
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {taskToEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
