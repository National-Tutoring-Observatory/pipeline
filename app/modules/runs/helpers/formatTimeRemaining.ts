export default function formatTimeRemaining(
  startedAt: Date | string | undefined | null,
  completed: number,
  total: number,
): string | null {
  const MIN_COMPLETED_FOR_ESTIMATE = 3;
  if (
    !startedAt ||
    completed < MIN_COMPLETED_FOR_ESTIMATE ||
    completed >= total
  )
    return null;

  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  if (elapsedMs <= 0) return null;

  const avgMsPerSession = elapsedMs / completed;
  const remainingMs = avgMsPerSession * (total - completed);
  const remainingSeconds = Math.round(remainingMs / 1000);

  if (remainingSeconds < 60) return "< 1 min remaining";

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.ceil((remainingSeconds % 3600) / 60);

  if (hours === 0) return `~${minutes} min remaining`;
  if (minutes === 0) return `~${hours} hr remaining`;
  return `~${hours} hr ${minutes} min remaining`;
}
