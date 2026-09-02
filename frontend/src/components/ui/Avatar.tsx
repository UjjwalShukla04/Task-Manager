import { avatarColor, initials } from "../../lib/taskMeta";
import { cn } from "../../utils/cn";

interface AvatarProps {
  name: string;
  id?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const sizes = {
  xs: "h-5 w-5 text-[11px]",
  sm: "h-6 w-6 text-[12px]",
  md: "h-8 w-8 text-xs",
};

export function Avatar({ name, id, size = "sm", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface",
        sizes[size],
        avatarColor(id ?? name),
        className
      )}
      title={name}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
