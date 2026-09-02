import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-raised px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-indigo-50 p-4 dark:bg-indigo-900/30">
        <ClipboardList className="h-8 w-8 text-indigo-500" aria-hidden />
      </div>
      <h3 className="text-lg font-medium text-fg">{title}</h3>
      <p className="mb-6 mt-1 max-w-sm text-sm text-fg-muted">{message}</p>
      {action}
    </div>
  );
}
