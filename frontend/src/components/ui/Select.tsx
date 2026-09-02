import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { fieldClass } from "./Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  srOnlyLabel?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, srOnlyLabel, id, children, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "mb-1.5 block text-[14px] font-medium text-fg",
              srOnlyLabel && "sr-only"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              fieldClass,
              "h-10 cursor-pointer appearance-none pr-9",
              error && "border-rose-400",
              className
            )}
            aria-invalid={!!error || undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
