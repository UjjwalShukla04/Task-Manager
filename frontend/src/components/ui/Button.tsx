import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-fg shadow-xs hover:bg-accent-hover active:scale-[0.98]",
  secondary:
    "bg-fg/6 text-fg hover:bg-fg/10 dark:bg-white/8 dark:hover:bg-white/12",
  outline:
    "border border-line-strong bg-surface text-fg hover:bg-fg/3 dark:hover:bg-white/4",
  danger: "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-[0.98]",
  ghost: "text-muted hover:bg-fg/5 hover:text-fg dark:hover:bg-white/6",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-[14px]",
  md: "h-9.5 px-4 text-sm",
  lg: "h-11 px-6 text-[16px]",
  icon: "h-9 w-9",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);

Button.displayName = "Button";
export { Button };
