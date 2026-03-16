import formatEstimatedTimeRange from "~/modules/app/helpers/formatEstimatedTimeRange";

export function formatCost(cost: number): string {
  if (cost === 0) {
    return "0.00";
  }

  if (cost < 0.01) {
    return "< 0.01";
  }

  return cost.toFixed(2);
}

export function formatTime(seconds: number): string {
  return formatEstimatedTimeRange(seconds);
}
