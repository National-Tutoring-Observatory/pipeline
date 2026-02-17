export default function calculateMeanKappa(
  pairs: { kappa: number; sampleSize: number }[],
): number {
  const validPairs = pairs.filter((pair) => pair.sampleSize > 0);
  if (validPairs.length === 0) return 0;

  const sum = validPairs.reduce((total, pair) => total + pair.kappa, 0);
  return Math.round((sum / validPairs.length) * 100) / 100;
}
