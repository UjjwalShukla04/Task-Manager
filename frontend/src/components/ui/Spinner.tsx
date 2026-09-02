import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-5 w-5 animate-spin text-muted", className)} aria-hidden />
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-7 w-7 text-accent" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
