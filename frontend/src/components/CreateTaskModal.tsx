import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { getAllUsers } from "../api/auth";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { PriorityPicker } from "./ui/PriorityPicker";
import { AssigneePicker } from "./ui/AssigneePicker";
import { DateField } from "./ui/DateField";
import { PRIORITIES, type Task } from "../types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Keep it under 120 characters"),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().min(1, "Pick a due date"),
  priority: z.enum(PRIORITIES),
  assignedToId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

/** "yyyy-MM-dd" -> end-of-day ISO string (timezone-safe). */
const toDueIso = (value: string) => new Date(`${value}T23:59:59`).toISOString();

const emptyDefaults: FormData = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  assignedToId: "",
};

export function CreateTaskModal({ isOpen, onClose, taskToEdit }: Props) {
  const isEdit = !!taskToEdit;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const pending = createMutation.isPending || updateMutation.isPending;
  const serverError =
    (createMutation.error as any)?.response?.data?.message ||
    (updateMutation.error as any)?.response?.data?.message;

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isOpen,
    staleTime: 60_000,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: emptyDefaults });

  const description = watch("description") ?? "";
  const titleField = register("title");

  useEffect(() => {
    if (!isOpen) return;
    createMutation.reset();
    updateMutation.reset();
    reset(
      taskToEdit
        ? {
            title: taskToEdit.title,
            description: taskToEdit.description,
            dueDate: format(new Date(taskToEdit.dueDate), "yyyy-MM-dd"),
            priority: taskToEdit.priority,
            assignedToId: taskToEdit.assignedToId ?? "",
          }
        : emptyDefaults
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskToEdit, isOpen]);

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      description: data.description ?? "",
      dueDate: toDueIso(data.dueDate),
      priority: data.priority,
    };
    if (isEdit && taskToEdit) {
      updateMutation.mutate(
        {
          id: taskToEdit.id,
          data: { ...payload, assignedToId: data.assignedToId || null },
        },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(
        { ...payload, assignedToId: data.assignedToId || undefined },
        { onSuccess: onClose }
      );
    }
  };

  const submit = handleSubmit(onSubmit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit task" : "New task"}
      description={
        isEdit ? "Update the details below." : "Capture what needs doing."
      }
      initialFocus={titleRef}
      footer={
        <div className="flex items-center justify-between">
          <span className="hidden text-[11px] text-faint sm:block">
            <kbd className="rounded border border-line px-1">⌘</kbd>
            <kbd className="ml-0.5 rounded border border-line px-1">↵</kbd> to save
          </span>
          <div className="flex flex-1 justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => submit()}
              isLoading={pending}
              disabled={isEdit && !isDirty}
            >
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      }
    >
      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        className="space-y-4"
      >
        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="sr-only">
            Title
          </label>
          <textarea
            id="task-title"
            rows={1}
            placeholder="Task title"
            {...titleField}
            ref={(el) => {
              titleField.ref(el);
              titleRef.current = el;
            }}
            className="w-full resize-none bg-transparent text-lg font-medium text-fg outline-none placeholder:text-faint/70"
          />
          {errors.title && (
            <p className="text-xs text-rose-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="task-description"
              className="text-[13px] font-medium text-fg"
            >
              Description
            </label>
            <span className="text-[11px] text-faint">{description.length}/5000</span>
          </div>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Add more detail…"
            {...register("description")}
            className="block w-full resize-y rounded-lg border border-line-strong bg-surface px-3.5 py-2 text-sm text-fg shadow-xs transition-colors placeholder:text-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
          />
        </div>

        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DateField
              value={field.value}
              onChange={field.onChange}
              error={errors.dueDate?.message}
            />
          )}
        />

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-fg">
            Priority
          </span>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <PriorityPicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-fg">
            Assignee
          </span>
          <Controller
            control={control}
            name="assignedToId"
            render={({ field }) => (
              <AssigneePicker
                users={usersQuery.data}
                loading={usersQuery.isLoading}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
