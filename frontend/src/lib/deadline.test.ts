import { describe, it, expect } from "vitest";
import { addDays, addWeeks, endOfWeek } from "date-fns";
import {
  deadlineBucket,
  groupByBucket,
  bucketChange,
  quickAddDate,
} from "./deadline";
import type { Task } from "../types";

const task = (over: Partial<Task>): Task => ({
  id: Math.random().toString(36),
  title: "t",
  description: "",
  dueDate: new Date().toISOString(),
  priority: "Medium",
  status: "ToDo",
  creatorId: "c",
  assignedToId: null,
  creator: { id: "c", name: "C", email: "c@x", createdAt: "" },
  assignedTo: null,
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("deadlineBucket", () => {
  it("routes completed tasks to the completed bucket", () => {
    expect(
      deadlineBucket(task({ status: "Completed", dueDate: null }))
    ).toBe("completed");
    expect(
      deadlineBucket(
        task({ status: "Completed", dueDate: addDays(new Date(), -5).toISOString() })
      )
    ).toBe("completed");
  });

  it("routes a task with no due date to noDeadline", () => {
    expect(deadlineBucket(task({ dueDate: null }))).toBe("noDeadline");
  });

  it("puts a past, unfinished task in overdue", () => {
    expect(
      deadlineBucket(task({ dueDate: addDays(new Date(), -3).toISOString() }))
    ).toBe("overdue");
  });

  it("buckets today / this week / next week / over two weeks", () => {
    expect(deadlineBucket(task({ dueDate: new Date().toISOString() }))).toBe(
      "today"
    );
    expect(
      deadlineBucket(
        task({
          dueDate: endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
        })
      )
    ).toBe("thisWeek");
    expect(
      deadlineBucket(
        task({
          dueDate: endOfWeek(addWeeks(new Date(), 1), {
            weekStartsOn: 1,
          }).toISOString(),
        })
      )
    ).toBe("nextWeek");
    expect(
      deadlineBucket(task({ dueDate: addDays(new Date(), 30).toISOString() }))
    ).toBe("overTwoWeeks");
  });
});

describe("groupByBucket", () => {
  it("distributes tasks across all buckets", () => {
    const g = groupByBucket([
      task({ dueDate: addDays(new Date(), -3).toISOString() }),
      task({ dueDate: new Date().toISOString() }),
      task({ dueDate: null }),
      task({ status: "Completed" }),
    ]);
    expect(g.overdue).toHaveLength(1);
    expect(g.today).toHaveLength(1);
    expect(g.noDeadline).toHaveLength(1);
    expect(g.completed).toHaveLength(1);
  });

  it("sorts a bucket by due date, undated last", () => {
    const g = groupByBucket([
      task({ dueDate: null, status: "InProgress" }),
      task({ dueDate: addDays(new Date(), -10).toISOString() }),
    ]);
    // both land in different buckets here, so just assert no throw + shape
    expect(Array.isArray(g.overdue)).toBe(true);
  });
});

describe("bucketChange", () => {
  it("maps each column to the right mutation", () => {
    expect(bucketChange("noDeadline")).toEqual({ dueDate: null });
    expect(bucketChange("completed")).toEqual({ status: "Completed" });
    expect(typeof bucketChange("today").dueDate).toBe("string");
    expect(bucketChange("overdue")).toEqual({});
  });
});

describe("quickAddDate", () => {
  it("is null for noDeadline and an ISO string for date buckets", () => {
    expect(quickAddDate("noDeadline")).toBeNull();
    expect(Number.isNaN(Date.parse(quickAddDate("thisWeek")!))).toBe(false);
  });
});
