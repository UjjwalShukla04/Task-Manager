import { Fragment, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { Check, ChevronsUpDown, UserRound } from "lucide-react";
import type { User } from "../../types";
import { Avatar } from "./Avatar";
import { cn } from "../../utils/cn";

interface Props {
  users: User[] | undefined;
  loading?: boolean;
  value: string; // user id, or "" for unassigned
  onChange: (value: string) => void;
}

export function AssigneePicker({ users, loading, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const selected = users?.find((u) => u.id === value) ?? null;

  const filtered =
    query.trim() === ""
      ? (users ?? [])
      : (users ?? []).filter((u) =>
          `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox
      value={value}
      onChange={(v: string | null) => onChange(v ?? "")}
      onClose={() => setQuery("")}
    >
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-line-strong bg-surface pl-3 shadow-xs focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
          {selected ? (
            <Avatar name={selected.name} id={selected.id} size="xs" />
          ) : (
            <UserRound className="h-4 w-4 text-faint" aria-hidden />
          )}
          <ComboboxInput
            className="h-10 w-full bg-transparent text-sm text-fg outline-none placeholder:text-faint"
            placeholder={loading ? "Loading people…" : "Unassigned"}
            displayValue={() => selected?.name ?? ""}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ComboboxButton className="pr-2.5 text-faint">
            <ChevronsUpDown className="h-4 w-4" aria-hidden />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          transition
          className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-line bg-elevated p-1 shadow-lg empty:invisible data-[closed]:opacity-0"
        >
          <ComboboxOption value="" as={Fragment}>
            {({ focus, selected: sel }) => (
              <li
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  focus ? "bg-accent text-white" : "text-muted"
                )}
              >
                <UserRound className="h-4 w-4" aria-hidden />
                <span className="flex-1">Unassigned</span>
                {sel && <Check className="h-4 w-4" />}
              </li>
            )}
          </ComboboxOption>

          {filtered.map((u) => (
            <ComboboxOption key={u.id} value={u.id} as={Fragment}>
              {({ focus, selected: sel }) => (
                <li
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    focus ? "bg-accent text-white" : "text-fg"
                  )}
                >
                  <Avatar name={u.name} id={u.id} size="xs" />
                  <span className="flex-1 truncate">
                    {u.name}
                    <span
                      className={cn(
                        "ml-1.5 text-xs",
                        focus ? "text-white/70" : "text-faint"
                      )}
                    >
                      {u.email}
                    </span>
                  </span>
                  {sel && <Check className="h-4 w-4" />}
                </li>
              )}
            </ComboboxOption>
          ))}

          {!loading && filtered.length === 0 && (
            <li className="px-2 py-2 text-center text-xs text-muted">
              No people found
            </li>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
