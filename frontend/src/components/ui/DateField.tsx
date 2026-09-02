import { format, addDays } from "date-fns";
import { cn } from "../../utils/cn";
import { fieldClass } from "./Input";

interface Props {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const chips = [
  { label: "Today", get: () => new Date() },
  { label: "Tomorrow", get: () => addDays(new Date(), 1) },
  { label: "Next week", get: () => addDays(new Date(), 7) },
];

export function DateField({ value, onChange, error, id = "task-due" }: Props) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[14px] font-medium text-fg">
          Due date
        </label>
        <div className="flex gap-1">
          {chips.map((c) => {
            const chipIso = iso(c.get());
            const active = value === chipIso;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onChange(chipIso)}
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "bg-fg/5 text-muted hover:text-fg dark:bg-white/6"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          fieldClass,
          "h-10",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
        )}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
