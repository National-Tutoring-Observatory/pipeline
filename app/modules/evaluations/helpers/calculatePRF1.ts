export interface PRF1Result {
  precision: number;
  recall: number;
  f1: number;
}

export default function calculatePRF1(
  predictions: string[],
  goldLabels: string[],
): PRF1Result {
  const n = predictions.length;
  if (n === 0 || goldLabels.length !== n) {
    return { precision: 0, recall: 0, f1: 0 };
  }

  const classes = [...new Set([...predictions, ...goldLabels])];

  let totalPrecision = 0;
  let totalRecall = 0;

  for (const targetClass of classes) {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    for (let i = 0; i < n; i++) {
      const predicted = predictions[i];
      const actual = goldLabels[i];

      if (predicted === targetClass && actual === targetClass) {
        tp++;
      } else if (predicted === targetClass && actual !== targetClass) {
        fp++;
      } else if (predicted !== targetClass && actual === targetClass) {
        fn++;
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    totalPrecision += precision;
    totalRecall += recall;
  }

  const avgPrecision = totalPrecision / classes.length;
  const avgRecall = totalRecall / classes.length;

  const f1 =
    avgPrecision + avgRecall > 0
      ? (2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall)
      : 0;

  return {
    precision: Math.round(avgPrecision * 100) / 100,
    recall: Math.round(avgRecall * 100) / 100,
    f1: Math.round(f1 * 100) / 100,
  };
}
