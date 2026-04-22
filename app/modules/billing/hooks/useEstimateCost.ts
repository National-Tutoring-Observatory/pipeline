import debounce from "lodash/debounce.js";
import { useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import type {
  EstimationResult,
  RunDefinition,
} from "~/modules/runSets/runSets.types";

const DEBOUNCE_MS = 300;

interface UseEstimateCostInput {
  projectId: string;
  definitions: RunDefinition[];
  sessionIds: string[];
  shouldRunVerification: boolean;
}

interface UseEstimateCostResult {
  estimation: EstimationResult;
  balance: number;
  isEstimating: boolean;
}

const EMPTY: EstimationResult = { estimatedCost: 0, estimatedTimeSeconds: 0 };

export default function useEstimateCost(
  input: UseEstimateCostInput,
): UseEstimateCostResult {
  const fetcher = useFetcher<{
    estimatedCost: number;
    estimatedTimeSeconds: number;
    balance: number;
  }>();

  const hasInputs = input.definitions.length > 0 && input.sessionIds.length > 0;

  const serialized = useMemo(
    () =>
      hasInputs
        ? JSON.stringify({
            projectId: input.projectId,
            definitions: input.definitions,
            sessionIds: input.sessionIds,
            shouldRunVerification: input.shouldRunVerification,
          })
        : null,
    [
      hasInputs,
      input.projectId,
      input.definitions,
      input.sessionIds,
      input.shouldRunVerification,
    ],
  );

  const submitEstimate = useMemo(
    () =>
      debounce((payload: string, fetcherSubmit: typeof fetcher.submit) => {
        fetcherSubmit(
          JSON.stringify({
            intent: "ESTIMATE_COST",
            payload: JSON.parse(payload),
          }),
          {
            method: "POST",
            action: "/api/estimateCost",
            encType: "application/json",
          },
        );
      }, DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    if (!serialized) return;
    submitEstimate(serialized, fetcher.submit);
    return () => submitEstimate.cancel();
  }, [serialized]);

  const estimation = useMemo(
    () =>
      fetcher.data
        ? {
            estimatedCost: fetcher.data.estimatedCost,
            estimatedTimeSeconds: fetcher.data.estimatedTimeSeconds,
          }
        : EMPTY,
    [fetcher.data],
  );

  if (!hasInputs) {
    return { estimation: EMPTY, balance: 0, isEstimating: false };
  }

  const balance = fetcher.data?.balance ?? 0;
  const isEstimating = fetcher.state !== "idle";

  return { estimation, balance, isEstimating };
}
