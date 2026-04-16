import { useEffect, useRef } from "react";
import type { useFetcher } from "react-router";

export default function useSubmitGuard(
  fetcher: ReturnType<typeof useFetcher>,
  shouldStayBusy = false,
) {
  const guardRef = useRef(false);

  useEffect(() => {
    if (fetcher.state === "idle" && !shouldStayBusy) {
      guardRef.current = false;
    }
  }, [fetcher.state, shouldStayBusy]);

  const isSubmitting = fetcher.state !== "idle" || shouldStayBusy;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guard = <T extends (...args: any[]) => void>(fn: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((...args: any[]) => {
      if (guardRef.current) return;
      guardRef.current = true;
      fn(...args);
    }) as T;
  };

  return { isSubmitting, guard };
}
