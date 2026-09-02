import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-fg-muted", className)}
      aria-hidden
    />
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-muted"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-8 w-8 text-indigo-500" />
      <p className="text-sm text-fg-muted">{label}</p>
    </div>
  );
}
