import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router";

const DEFAULT_INTERVAL_MS = 20000;

export default function usePollingRevalidation(
  intervalMs: number = DEFAULT_INTERVAL_MS,
) {
  const revalidator = useRevalidator();
  const nextRevalidationTime = useRef<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.round(intervalMs / 1000),
  );

  useEffect(() => {
    nextRevalidationTime.current = Date.now() + intervalMs;

    const tick = () => {
      const remaining = Math.round(
        ((nextRevalidationTime.current as number) - Date.now()) / 1000,
      );

      if (remaining <= 0 && document.visibilityState === "visible") {
        revalidator.revalidate();
        nextRevalidationTime.current = Date.now() + intervalMs;
        setSecondsRemaining(Math.round(intervalMs / 1000));
      } else {
        setSecondsRemaining(Math.max(0, remaining));
      }
    };

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { secondsRemaining };
}
