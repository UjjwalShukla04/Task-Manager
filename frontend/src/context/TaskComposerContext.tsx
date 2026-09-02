import { createContext, useContext, useState, type ReactNode } from "react";
import type { Task, TaskStatus } from "../types";
import { CreateTaskModal } from "../components/CreateTaskModal";

interface ComposerValue {
  openCreate: (defaults?: { status?: TaskStatus }) => void;
  openEdit: (task: Task) => void;
}

const Ctx = createContext<ComposerValue | undefined>(undefined);

export function TaskComposerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const value: ComposerValue = {
    openCreate: () => {
      setEditing(undefined);
      setOpen(true);
    },
    openEdit: (task) => {
      setEditing(task);
      setOpen(true);
    },
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <CreateTaskModal
        isOpen={open}
        onClose={() => setOpen(false)}
        taskToEdit={editing}
      />
    </Ctx.Provider>
  );
}

export function useTaskComposer() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useTaskComposer must be used within a TaskComposerProvider");
  return ctx;
}
