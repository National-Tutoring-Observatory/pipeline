interface FormatEstimatedTimeRangeOptions {
  minFactor?: number;
  maxFactor?: number;
  suffix?: string;
}

const DEFAULT_MIN_FACTOR = 0.5;
const DEFAULT_MAX_FACTOR = 2;

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes} min`;
}

export default function formatEstimatedTimeRange(
  seconds: number,
  options?: FormatEstimatedTimeRangeOptions,
): string {
  if (seconds < 60) {
    return `< 1 min${options?.suffix || ""}`;
  }

  const minFactor = options?.minFactor ?? DEFAULT_MIN_FACTOR;
  const maxFactor = options?.maxFactor ?? DEFAULT_MAX_FACTOR;

  const lowerMinutes = Math.max(1, Math.floor((seconds * minFactor) / 60));
  const upperMinutes = Math.max(
    lowerMinutes + 1,
    Math.ceil((seconds * maxFactor) / 60),
  );

  if (upperMinutes < 60) {
    return `${lowerMinutes}-${upperMinutes} min${options?.suffix || ""}`;
  }

  return `${formatMinutes(lowerMinutes)} - ${formatMinutes(upperMinutes)}${options?.suffix || ""}`;
}
