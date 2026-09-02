import type { ReactNode } from "react";
import { LayoutGrid, Check } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";

const highlights = [
  "Real-time collaboration",
  "Kanban board & list views",
  "Priority & due-date tracking",
  "Instant notifications",
];

/** Split-screen auth layout: form on the left, product showpiece on the right. */
export function AuthShell({
  heading,
  subheading,
  children,
  footer,
}: {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-app">
      {/* form */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[46%] lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-white shadow-xs">
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </span>
            TaskFlow
          </span>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-[26px] font-semibold tracking-tight text-fg">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{subheading}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-[14px] text-muted">{footer}</p>
        </div>
      </div>

      {/* showpiece */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[54%]">
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-dots absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

        <div className="relative flex h-full flex-col justify-center gap-10 px-14 text-white xl:px-20">
          <div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
              Where your team’s work comes together.
            </h2>
            <p className="mt-3 max-w-sm text-[16px] text-white/80">
              Plan, assign and track tasks on a board that updates for everyone
              the moment something changes.
            </p>
          </div>

          {/* floating glass preview */}
          <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { t: "To Do", n: 3 },
                { t: "In Progress", n: 2 },
                { t: "Done", n: 5 },
              ].map((col) => (
                <div key={col.t} className="rounded-lg bg-white/10 p-2">
                  <p className="mb-2 text-[12px] font-medium text-white/70">
                    {col.t}
                  </p>
                  <div className="space-y-1.5">
                    {Array.from({ length: col.n > 3 ? 3 : col.n }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 rounded-md bg-white/20"
                        style={{ width: `${70 + ((i * 13) % 30)}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
