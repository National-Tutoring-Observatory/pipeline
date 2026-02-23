/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useSubmitGuard from "../hooks/useSubmitGuard";

function createMockFetcher(state = "idle" as string, data?: any) {
  return { state, data } as ReturnType<
    typeof import("react-router").useFetcher
  >;
}

describe("useSubmitGuard", () => {
  it("allows the first call through", () => {
    const fetcher = createMockFetcher();
    const { result } = renderHook(() => useSubmitGuard(fetcher));

    const fn = vi.fn();
    act(() => {
      result.current.guard(fn)("arg1");
    });

    expect(fn).toHaveBeenCalledWith("arg1");
  });

  it("blocks a second click before React re-renders", () => {
    const fetcher = createMockFetcher();
    const { result } = renderHook(() => useSubmitGuard(fetcher));

    const submit = vi.fn();
    const guarded = result.current.guard(submit);

    act(() => {
      guarded();
      guarded();
    });

    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("resets guard when fetcher returns to idle", () => {
    let fetcher = createMockFetcher();
    const { result, rerender } = renderHook(() => useSubmitGuard(fetcher));

    const fn = vi.fn();
    act(() => {
      result.current.guard(fn)();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    fetcher = createMockFetcher("submitting");
    rerender();

    fetcher = createMockFetcher("idle");
    rerender();

    act(() => {
      result.current.guard(fn)();
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("keeps isSubmitting true after success while waiting for navigation", () => {
    const actionSucceeded = true;
    const fetcher = createMockFetcher("idle");
    const { result } = renderHook(() =>
      useSubmitGuard(fetcher, actionSucceeded),
    );

    expect(result.current.isSubmitting).toBe(true);
  });

  it("stays guarded after success while waiting for navigation", () => {
    let fetcher = createMockFetcher();
    let actionSucceeded = false;
    const { result, rerender } = renderHook(() =>
      useSubmitGuard(fetcher, actionSucceeded),
    );

    const submit = vi.fn();
    act(() => {
      result.current.guard(submit)();
    });
    expect(submit).toHaveBeenCalledTimes(1);

    actionSucceeded = true;
    fetcher = createMockFetcher("submitting");
    rerender();

    fetcher = createMockFetcher("idle");
    rerender();

    act(() => {
      result.current.guard(submit)();
    });
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("allows resubmission after an error", () => {
    let fetcher = createMockFetcher();
    const actionSucceeded = false;
    const { result, rerender } = renderHook(() =>
      useSubmitGuard(fetcher, actionSucceeded),
    );

    const submit = vi.fn();
    act(() => {
      result.current.guard(submit)();
    });
    expect(submit).toHaveBeenCalledTimes(1);

    fetcher = createMockFetcher("submitting");
    rerender();

    fetcher = createMockFetcher("idle");
    rerender();

    act(() => {
      result.current.guard(submit)();
    });
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("reports isSubmitting based on fetcher state", () => {
    let fetcher = createMockFetcher("submitting");
    const { result, rerender } = renderHook(() => useSubmitGuard(fetcher));

    expect(result.current.isSubmitting).toBe(true);

    fetcher = createMockFetcher("idle");
    rerender();

    expect(result.current.isSubmitting).toBe(false);
  });
});
