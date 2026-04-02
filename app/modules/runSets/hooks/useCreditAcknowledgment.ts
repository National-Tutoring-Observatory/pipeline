import { useState } from "react";

export interface CreditAcknowledgment {
  exceedsBalance: boolean;
  acknowledged: boolean;
  setAcknowledged: (value: boolean) => void;
}

export default function useCreditAcknowledgment(
  estimatedCost: number,
  balance: number,
): CreditAcknowledgment {
  const [acknowledged, setAcknowledged] = useState(false);
  const [prevEstimatedCost, setPrevEstimatedCost] = useState<number | null>(
    null,
  );

  if (estimatedCost !== prevEstimatedCost) {
    setPrevEstimatedCost(estimatedCost);
    setAcknowledged(false);
  }

  return {
    exceedsBalance: estimatedCost > balance,
    acknowledged,
    setAcknowledged,
  };
}
