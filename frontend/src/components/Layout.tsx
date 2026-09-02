import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTaskRealtime } from "../hooks/useTasks";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ui/ThemeToggle";
import { LayoutGrid, List, LogOut } from "lucide-react";
import { cn } from "../utils/cn";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-indigo-600 text-white"
      : "text-fg-muted hover:bg-surface-muted hover:text-fg"
  );

export default function Layout() {
  const { user, logout } = useAuth();
  useTaskRealtime();

  return (
    <div className="min-h-screen bg-surface-muted">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-lg font-bold">
              <LayoutGrid className="h-6 w-6 text-indigo-600" aria-hidden />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                TaskFlow
              </span>
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
            <span className="hidden rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm text-fg-muted sm:inline">
              {user?.name}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
