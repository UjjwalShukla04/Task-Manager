import { cn } from "../../utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-fg/7 dark:bg-white/7",
        className
      )}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-elevated p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-4 h-3 w-2/3" />
      <div className="flex items-center justify-between border-t border-line pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function TaskGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
