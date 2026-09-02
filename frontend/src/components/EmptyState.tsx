import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-elevated px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
        {icon ?? <ClipboardList className="h-6 w-6" aria-hidden />}
      </div>
      <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
      <p className="mb-6 mt-1 max-w-xs text-sm text-muted">{message}</p>
      {action}
    </div>
  );
}
