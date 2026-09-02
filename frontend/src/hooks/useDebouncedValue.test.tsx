import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200));
    expect(result.current).toBe("a");
  });

  it("updates only after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebouncedValue(v, 200),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    advance(199);
    expect(result.current).toBe("a");
    advance(1);
    expect(result.current).toBe("b");
  });

  it("resets the timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebouncedValue(v, 200),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    advance(150);
    rerender({ v: "c" });
    advance(150);
    expect(result.current).toBe("a");
    advance(50);
    expect(result.current).toBe("c");
  });
});
