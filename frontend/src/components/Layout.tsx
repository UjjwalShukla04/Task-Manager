import { Fragment } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { LayoutGrid, List, LogOut, Check, Command } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTaskRealtime } from "../hooks/useTasks";
import { useTheme } from "../context/ThemeContext";
import {
  TaskComposerProvider,
  useTaskComposer,
} from "../context/TaskComposerContext";
import { CommandPalette } from "./CommandPalette";
import { Avatar } from "./ui/Avatar";
import { cn } from "../utils/cn";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors",
    isActive ? "bg-fg/6 text-fg dark:bg-white/8" : "text-muted hover:text-fg"
  );

function Chrome() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { openCreate } = useTaskComposer();
  useTaskRealtime();

  return (
    <div className="min-h-screen bg-app">
      <CommandPalette onNewTask={() => openCreate()} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-app/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white shadow-xs">
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </span>
              TaskFlow
            </span>
            <nav className="flex items-center gap-1" aria-label="Views">
              <NavLink to="/" end className={navLinkClass}>
                <LayoutGrid className="h-4 w-4" aria-hidden /> Board
              </NavLink>
              <NavLink to="/list" className={navLinkClass}>
                <List className="h-4 w-4" aria-hidden /> List
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.dispatchEvent(new Event("command-palette:open"))
              }
              className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg sm:flex"
              aria-label="Open command palette"
            >
              <Command className="h-3.5 w-3.5" aria-hidden />
              <span>Quick actions</span>
              <kbd className="rounded border border-line px-1 text-[11px]">⌘K</kbd>
            </button>

            <Menu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-fg/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:hover:bg-white/6">
                {user && <Avatar name={user.name} id={user.id} size="md" />}
                <span className="hidden text-[14px] font-medium text-fg sm:inline">
                  {user?.name}
                </span>
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-line bg-elevated p-1 shadow-lg focus:outline-none">
                  <div className="px-3 py-2">
                    <p className="truncate text-[14px] font-medium text-fg">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <p className="px-3 pb-1 pt-1.5 text-[12px] font-medium uppercase tracking-wide text-faint">
                    Theme
                  </p>
                  {(["light", "dark", "system"] as const).map((t) => (
                    <MenuItem key={t}>
                      <button
                        onClick={() => setTheme(t)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[14px] capitalize text-fg data-[focus]:bg-fg/6 dark:data-[focus]:bg-white/6"
                      >
                        {t}
                        {theme === t && (
                          <Check className="h-3.5 w-3.5 text-accent" />
                        )}
                      </button>
                    </MenuItem>
                  ))}
                  <div className="my-1 h-px bg-line" />
                  <MenuItem>
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[14px] text-rose-600 data-[focus]:bg-rose-500/10 dark:text-rose-400"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <TaskComposerProvider>
      <Chrome />
    </TaskComposerProvider>
  );
}
