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
  if (seconds < 30) {
    return "< 30s";
  }

  if (seconds < 60) {
    return "~ 1 min";
  }

  const roundedMinutes = Math.round(seconds / 60);

  if (roundedMinutes < 60) {
    return `~ ${roundedMinutes} min`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (remainingMinutes === 0) {
    return `~ ${hours}h`;
  }

  return `~ ${hours}h ${remainingMinutes} min`;
}
