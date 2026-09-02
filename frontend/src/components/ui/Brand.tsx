import { LayoutGrid } from "lucide-react";
import { cn } from "../../utils/cn";

interface BrandProps {
  size?: "sm" | "lg" | "xl";
  className?: string;
}

const map = {
  sm: { gap: "gap-2", tile: "h-7 w-7 rounded-lg", icon: "h-4 w-4", text: "text-[15px]" },
  lg: { gap: "gap-3", tile: "h-11 w-11 rounded-xl", icon: "h-6 w-6", text: "text-2xl" },
  xl: {
    gap: "gap-3.5",
    tile: "h-14 w-14 rounded-2xl",
    icon: "h-7 w-7",
    text: "text-[32px] leading-none",
  },
} as const;

export function Brand({ size = "sm", className }: BrandProps) {
  const s = map[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-inset ring-white/20",
          s.tile
        )}
      >
        <LayoutGrid className={s.icon} aria-hidden />
      </span>
      <span className={cn("font-bold tracking-tight text-fg", s.text)}>
        Task<span className="text-accent">Flow</span>
      </span>
    </span>
  );
}
