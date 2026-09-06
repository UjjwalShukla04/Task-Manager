import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogPanel,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Monitor,
  CornerDownLeft,
  CalendarClock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/cn";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  keywords?: string;
}

export function CommandPalette({ onNewTask }: { onNewTask: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onOpen);
    };
  }, []);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "new",
        label: "New task",
        hint: "Create",
        icon: Plus,
        run: onNewTask,
        keywords: "add create",
      },
      {
        id: "board",
        label: "Go to Board",
        icon: LayoutGrid,
        run: () => navigate("/"),
        keywords: "kanban status",
      },
      {
        id: "deadline",
        label: "Go to Deadline",
        icon: CalendarClock,
        run: () => navigate("/deadline"),
        keywords: "due date schedule overdue",
      },
      {
        id: "list",
        label: "Go to List",
        icon: List,
        run: () => navigate("/list"),
        keywords: "table tasks",
      },
      {
        id: "light",
        label: "Theme: Light",
        icon: Sun,
        run: () => setTheme("light"),
      },
      {
        id: "dark",
        label: "Theme: Dark",
        icon: Moon,
        run: () => setTheme("dark"),
      },
      {
        id: "system",
        label: "Theme: System",
        icon: Monitor,
        run: () => setTheme("system"),
      },
    ],
    [navigate, onNewTask, setTheme]
  );

  const q = query.trim().toLowerCase();
  const filtered = q
    ? commands.filter((c) =>
        `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q)
      )
    : commands;

  const searchAction: Command | null = q
    ? {
        id: "search",
        label: `Search tasks for “${query.trim()}”`,
        icon: Search,
        run: () => navigate(`/list?search=${encodeURIComponent(query.trim())}`),
      }
    : null;

  const items = searchAction ? [searchAction, ...filtered] : filtered;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <Transition appear show={open} as={Fragment} afterLeave={() => setQuery("")}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[3px]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4 pt-[12vh]">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 translate-y-2 scale-[0.98]"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPanel className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-elevated shadow-lg">
              <Combobox
                onChange={(cmd: Command | null) => {
                  if (!cmd) return;
                  close();
                  cmd.run();
                }}
              >
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
                  <ComboboxInput
                    autoFocus
                    className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-faint"
                    placeholder="Type a command or search…"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] font-medium text-faint">
                    ESC
                  </kbd>
                </div>

                <ComboboxOptions static className="max-h-80 overflow-y-auto p-1.5">
                  {items.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-muted">
                      No matches
                    </p>
                  )}
                  {items.map((cmd) => (
                    <ComboboxOption key={cmd.id} value={cmd} as={Fragment}>
                      {({ focus }) => (
                        <li
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm",
                            focus ? "bg-accent text-white" : "text-fg"
                          )}
                        >
                          <cmd.icon className="h-4 w-4 shrink-0 opacity-80" />
                          <span className="flex-1 truncate">{cmd.label}</span>
                          {cmd.hint && (
                            <span
                              className={cn(
                                "text-[12px]",
                                focus ? "text-white/70" : "text-faint"
                              )}
                            >
                              {cmd.hint}
                            </span>
                          )}
                          {focus && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-white/70" />
                          )}
                        </li>
                      )}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
