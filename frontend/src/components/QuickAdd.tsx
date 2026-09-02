import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTask, updateTask } from "../api/tasks";
import type { TaskStatus } from "../types";

/** Inline one-line task composer shown at the bottom of a board column. */
export function QuickAdd({ status }: { status: TaskStatus }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: async (value: string) => {
      const due = new Date();
      due.setDate(due.getDate() + 7);
      const task = await createTask({
        title: value,
        dueDate: due.toISOString(),
        priority: "Medium",
      });
      if (status !== "ToDo") {
        return updateTask(task.id, { status });
      }
      return task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Couldn’t add task"),
  });

  const submit = () => {
    const value = title.trim();
    if (value) mutation.mutate(value);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-faint transition-colors hover:bg-fg/4 hover:text-muted dark:hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add task
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-1.5 shadow-xs">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setOpen(false);
            setTitle("");
          }
        }}
        onBlur={() => {
          if (!title.trim()) setOpen(false);
        }}
        placeholder="Task title, then Enter"
        aria-label={`Add task to ${status}`}
        className="w-full bg-transparent px-2 py-1 text-[13px] text-fg outline-none placeholder:text-faint"
      />
    </div>
  );
}
