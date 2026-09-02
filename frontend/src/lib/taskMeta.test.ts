import { describe, it, expect } from "vitest";
import { avatarColor, initials, priorityMeta, statusMeta } from "./taskMeta";

describe("initials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(initials("ada lovelace")).toBe("AL");
    expect(initials("Grace")).toBe("G");
    expect(initials("  mary  jane  watson ")).toBe("MJ");
  });
});

describe("avatarColor", () => {
  it("is deterministic for the same seed", () => {
    expect(avatarColor("user-1")).toBe(avatarColor("user-1"));
  });
  it("returns a tailwind bg class", () => {
    expect(avatarColor("abc")).toMatch(/^bg-[a-z]+-500$/);
  });
});

describe("meta tables", () => {
  it("covers every priority and status", () => {
    expect(Object.keys(priorityMeta)).toEqual(["Low", "Medium", "High", "Urgent"]);
    expect(Object.keys(statusMeta)).toEqual([
      "ToDo",
      "InProgress",
      "Review",
      "Completed",
    ]);
  });
});
