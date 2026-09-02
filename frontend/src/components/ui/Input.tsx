import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Keep the label in the a11y tree but hide it visually. */
  srOnlyLabel?: boolean;
}

const fieldClasses =
  "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, srOnlyLabel, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1 block text-sm font-medium text-fg",
              srOnlyLabel && "sr-only"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(fieldClasses, error && "border-red-500 focus-visible:ring-red-500", className)}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-fg-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
