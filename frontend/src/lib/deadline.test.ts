import { describe, it, expect } from "vitest";
import { addDays, addWeeks, endOfWeek } from "date-fns";
import { deadlineBucket, groupByBucket, bucketTargetIso } from "./deadline";
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
  it("puts a past, unfinished task in overdue", () => {
    expect(
      deadlineBucket(task({ dueDate: addDays(new Date(), -3).toISOString() }))
    ).toBe("overdue");
  });

  it("does not mark a completed past task as overdue", () => {
    expect(
      deadlineBucket(
        task({
          dueDate: addDays(new Date(), -3).toISOString(),
          status: "Completed",
        })
      )
    ).not.toBe("overdue");
  });

  it("groupByBucket drops completed tasks", () => {
    const g = groupByBucket([
      task({ dueDate: addDays(new Date(), -3).toISOString(), status: "Completed" }),
      task({ dueDate: new Date().toISOString() }),
    ]);
    const total =
      g.overdue.length +
      g.today.length +
      g.thisWeek.length +
      g.nextWeek.length +
      g.later.length;
    expect(total).toBe(1);
  });

  it("buckets today / this week / next week / later", () => {
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
    ).toBe("later");
  });
});

describe("groupByBucket", () => {
  it("distributes tasks and sorts each bucket by due date", () => {
    const g = groupByBucket([
      task({ dueDate: addDays(new Date(), 40).toISOString() }),
      task({ dueDate: addDays(new Date(), 25).toISOString() }),
      task({ dueDate: new Date().toISOString() }),
    ]);
    expect(g.today).toHaveLength(1);
    expect(g.later).toHaveLength(2);
    expect(+new Date(g.later[0].dueDate)).toBeLessThan(
      +new Date(g.later[1].dueDate)
    );
  });
});

describe("bucketTargetIso", () => {
  it("returns a valid future-ish ISO string per bucket", () => {
    for (const b of ["today", "thisWeek", "nextWeek", "later"] as const) {
      expect(Number.isNaN(Date.parse(bucketTargetIso(b)))).toBe(false);
    }
  });
});
