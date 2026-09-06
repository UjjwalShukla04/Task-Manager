import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { getTaskActivity } from "../api/tasks";
import { STATUS_LABELS, type TaskActivity, type TaskStatus } from "../types";
import { Avatar } from "./ui/Avatar";
import { Spinner } from "./ui/Spinner";

const label = (s: unknown) =>
  STATUS_LABELS[s as TaskStatus] ?? String(s ?? "—");

function describe(a: TaskActivity): string {
  const d = a.detail ?? {};
  switch (a.type) {
    case "Created":
      return d.assignedTo
        ? `created this task and assigned it to ${d.assignedTo}`
        : "created this task";
    case "StatusChanged":
      return `moved it from ${label(d.from)} to ${label(d.to)}`;
    case "Reassigned":
      return `reassigned it ${d.from ? `from ${d.from} ` : ""}to ${
        d.to ?? "nobody"
      }`;
    case "Updated": {
      const fields = Array.isArray(d.fields) ? d.fields : [];
      return `edited ${fields.join(", ") || "the task"}`;
    }
    default:
      return "updated the task";
  }
}

export function TaskActivityLog({ taskId }: { taskId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["task-activity", taskId],
    queryFn: () => getTaskActivity(taskId),
    staleTime: 0,
  });

  return (
    <section className="border-t border-line pt-4">
      <h3 className="mb-3 text-[13px] font-medium text-fg">Activity</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="text-[13px] text-muted">Couldn’t load activity.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-[13px] text-muted">No activity yet.</p>
      ) : (
        <ol className="space-y-3">
          {data.map((a) => (
            <li key={a.id} className="flex items-start gap-2.5">
              <Avatar name={a.actor.name} id={a.actor.id} size="xs" />
              <div className="min-w-0 flex-1 text-[13px] leading-snug">
                <span className="font-medium text-fg">{a.actor.name}</span>{" "}
                <span className="text-muted">{describe(a)}</span>
                <span className="ml-1.5 whitespace-nowrap text-[11px] text-faint">
                  {formatDistanceToNowStrict(new Date(a.createdAt))} ago
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
