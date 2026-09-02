import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "./TaskCard";
import type { Task } from "../types";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "me", name: "Me", email: "me@x.dev" } }),
}));

const baseTask: Task = {
  id: "t1",
  title: "Write the docs",
  description: "Cover the API",
  dueDate: "2999-01-01T00:00:00.000Z",
  priority: "High",
  status: "ToDo",
  creatorId: "me",
  assignedToId: null,
  creator: { id: "me", name: "Me", email: "me@x.dev", createdAt: "" },
  assignedTo: null,
  createdAt: "2020-01-01T00:00:00.000Z",
  updatedAt: "2020-01-01T00:00:00.000Z",
};

describe("TaskCard", () => {
  it("renders the title, priority and future due date", () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByText("Write the docs")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Jan 1")).toBeInTheDocument();
  });

  it("flags an overdue, non-completed task", () => {
    render(
      <TaskCard task={{ ...baseTask, dueDate: "2000-01-01T00:00:00.000Z" }} />
    );
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("shows the delete action only to the creator", () => {
    const onDelete = vi.fn();
    const { rerender } = render(
      <TaskCard task={baseTask} onEdit={vi.fn()} onDelete={onDelete} />
    );
    expect(
      screen.getByRole("button", { name: /delete write the docs/i })
    ).toBeInTheDocument();

    rerender(
      <TaskCard
        task={{ ...baseTask, creatorId: "someone-else" }}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    expect(
      screen.queryByRole("button", { name: /delete write the docs/i })
    ).not.toBeInTheDocument();
  });
});
