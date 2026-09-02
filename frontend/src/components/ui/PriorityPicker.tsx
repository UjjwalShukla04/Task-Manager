import { RadioGroup, Radio } from "@headlessui/react";
import type { Priority } from "../../types";
import { PRIORITIES } from "../../types";
import { priorityMeta } from "../../lib/taskMeta";
import { cn } from "../../utils/cn";

interface Props {
  value: Priority;
  onChange: (value: Priority) => void;
}

export function PriorityPicker({ value, onChange }: Props) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="grid grid-cols-4 gap-1.5"
      aria-label="Priority"
    >
      {PRIORITIES.map((p) => (
        <Radio
          key={p}
          value={p}
          className={cn(
            "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[14px] font-medium transition-colors",
            "border-line-strong text-muted hover:text-fg",
            "data-[checked]:border-accent data-[checked]:bg-accent/8 data-[checked]:text-fg",
            "data-[focus]:ring-2 data-[focus]:ring-accent data-[focus]:ring-offset-1 data-[focus]:ring-offset-elevated"
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", priorityMeta[p].dot)}
            aria-hidden
          />
          {p}
        </Radio>
      ))}
    </RadioGroup>
  );
}
