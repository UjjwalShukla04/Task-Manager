import { CreateTaskSchema, TaskFilterSchema, UpdateTaskSchema } from "../task.dto";

describe("CreateTaskSchema", () => {
  const base = {
    title: "  Ship it  ",
    dueDate: "2030-01-01",
    priority: "High",
  };

  it("trims the title and coerces the due date", () => {
    const parsed = CreateTaskSchema.parse(base);
    expect(parsed.title).toBe("Ship it");
    expect(parsed.description).toBeUndefined();
    expect(parsed.dueDate).toBeInstanceOf(Date);
  });

  it("trims a provided description", () => {
    const parsed = CreateTaskSchema.parse({ ...base, description: "  hi  " });
    expect(parsed.description).toBe("hi");
  });

  it("rejects an invalid priority", () => {
    expect(() => CreateTaskSchema.parse({ ...base, priority: "Meh" })).toThrow();
  });

  it("rejects an invalid due date", () => {
    expect(() =>
      CreateTaskSchema.parse({ ...base, dueDate: "not-a-date" })
    ).toThrow();
  });

  it("rejects a non-uuid assignee", () => {
    expect(() =>
      CreateTaskSchema.parse({ ...base, assignedToId: "abc" })
    ).toThrow();
  });
});

describe("UpdateTaskSchema", () => {
  it("requires at least one field", () => {
    expect(() => UpdateTaskSchema.parse({})).toThrow("No fields to update");
  });

  it("allows clearing the assignee with null", () => {
    expect(UpdateTaskSchema.parse({ assignedToId: null }).assignedToId).toBeNull();
  });
});

describe("TaskFilterSchema", () => {
  it("applies pagination + sort defaults", () => {
    const parsed = TaskFilterSchema.parse({});
    expect(parsed).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      order: "desc",
    });
  });

  it("coerces numeric query strings and caps the limit", () => {
    expect(TaskFilterSchema.parse({ page: "3", limit: "50" })).toMatchObject({
      page: 3,
      limit: 50,
    });
    expect(() => TaskFilterSchema.parse({ limit: "500" })).toThrow();
  });
});
