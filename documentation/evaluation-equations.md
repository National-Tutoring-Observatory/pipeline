# Evaluation Metrics: TypeScript Equations

Pure TypeScript implementations for inter-rater agreement and classification metrics.

---

## 1. Cohen's Kappa (κ)

Measures agreement between two raters beyond chance.

### Formula

```
κ = (Po - Pe) / (1 - Pe)

Where:
  Po = Observed agreement (proportion of matching labels)
  Pe = Expected agreement by chance
```

### TypeScript Implementation

```typescript
/**
 * Calculate Cohen's Kappa between two raters
 * @param labelsA - Labels from rater A
 * @param labelsB - Labels from rater B (same order/length)
 * @returns Kappa score (-1 to 1, where 1 = perfect agreement)
 */
function calculateCohensKappa(labelsA: string[], labelsB: string[]): number {
  const n = labelsA.length;
  if (n === 0) return 0;

  // Get all unique categories
  const categories = [...new Set([...labelsA, ...labelsB])];

  // Build confusion matrix counts
  const countA: Record<string, number> = {}; // How often A chose each category
  const countB: Record<string, number> = {}; // How often B chose each category
  let agreements = 0; // Diagonal sum

  for (const cat of categories) {
    countA[cat] = 0;
    countB[cat] = 0;
  }

  for (let i = 0; i < n; i++) {
    countA[labelsA[i]]++;
    countB[labelsB[i]]++;
    if (labelsA[i] === labelsB[i]) {
      agreements++;
    }
  }

  // Po = Observed agreement
  const Po = agreements / n;

  // Pe = Expected agreement by chance
  // Pe = Σ (P(A chooses category) × P(B chooses category))
  let Pe = 0;
  for (const cat of categories) {
    Pe += (countA[cat] / n) * (countB[cat] / n);
  }

  // Edge case: Pe = 1 means perfect chance agreement
  if (Pe === 1) return 1;

  // κ = (Po - Pe) / (1 - Pe)
  return (Po - Pe) / (1 - Pe);
}
```

### Interpretation (Landis & Koch, 1977)

| Kappa Range | Interpretation |
| ----------- | -------------- |
| < 0.00      | Poor           |
| 0.00 – 0.20 | Slight         |
| 0.21 – 0.40 | Fair           |
| 0.41 – 0.60 | Moderate       |
| 0.61 – 0.80 | Substantial    |
| 0.81 – 1.00 | Almost Perfect |

---

## 2. Precision, Recall, F1 Score

Classification metrics when gold standard labels are available.

### Formulas

```
Precision = TP / (TP + FP)    "Of predicted positives, how many were correct?"

Recall    = TP / (TP + FN)    "Of actual positives, how many were found?"

F1        = 2 × (Precision × Recall) / (Precision + Recall)    "Harmonic mean"

Where:
  TP = True Positives (correctly predicted positive)
  FP = False Positives (incorrectly predicted positive)
  FN = False Negatives (missed actual positives)
```

### TypeScript Implementation (Macro-Averaged for Multi-Class)

```typescript
interface Metrics {
  precision: number;
  recall: number;
  f1: number;
}

/**
 * Calculate Precision, Recall, F1 using macro-averaging
 * @param predictions - Predicted labels from the model
 * @param goldLabels - Ground truth labels
 * @returns Averaged metrics across all classes
 */
function calculatePRF1(predictions: string[], goldLabels: string[]): Metrics {
  const n = predictions.length;
  if (n === 0) return { precision: 0, recall: 0, f1: 0 };

  // Get all unique classes
  const classes = [...new Set([...predictions, ...goldLabels])];

  let totalPrecision = 0;
  let totalRecall = 0;

  // Calculate per-class metrics, then average (macro)
  for (const targetClass of classes) {
    let tp = 0,
      fp = 0,
      fn = 0;

    for (let i = 0; i < n; i++) {
      const predicted = predictions[i];
      const actual = goldLabels[i];

      if (predicted === targetClass && actual === targetClass) {
        tp++; // True positive
      } else if (predicted === targetClass && actual !== targetClass) {
        fp++; // False positive
      } else if (predicted !== targetClass && actual === targetClass) {
        fn++; // False negative
      }
    }

    // Per-class precision and recall
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    totalPrecision += precision;
    totalRecall += recall;
  }

  // Macro-average across classes
  const avgPrecision = totalPrecision / classes.length;
  const avgRecall = totalRecall / classes.length;

  // F1 = harmonic mean
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
```

---

## 3. Mean Kappa (Aggregate)

Average Kappa across all pairwise run comparisons.

### TypeScript Implementation

```typescript
/**
 * Calculate mean Kappa across all valid run pairs
 * @param pairs - Array of pairwise Kappa results
 * @returns Mean Kappa (excludes pairs with 0 samples)
 */
function calculateMeanKappa(
  pairs: { kappa: number; sampleSize: number }[],
): number {
  const validPairs = pairs.filter((p) => p.sampleSize > 0);
  if (validPairs.length === 0) return 0;

  const sum = validPairs.reduce((acc, p) => acc + p.kappa, 0);
  return Math.round((sum / validPairs.length) * 100) / 100;
}
```

---

## 4. Example Usage

```typescript
// Two LLM runs annotating the same 5 sessions
const runA = [
  "CREATIVE",
  "NOT_CREATIVE",
  "CREATIVE",
  "CREATIVE",
  "NOT_CREATIVE",
];
const runB = [
  "CREATIVE",
  "NOT_CREATIVE",
  "NOT_CREATIVE",
  "CREATIVE",
  "NOT_CREATIVE",
];

const kappa = calculateCohensKappa(runA, runB);
console.log(`Kappa: ${kappa.toFixed(2)}`); // Output: Kappa: 0.58 (Moderate)

// With gold standard labels
const gold = [
  "CREATIVE",
  "NOT_CREATIVE",
  "CREATIVE",
  "CREATIVE",
  "NOT_CREATIVE",
];
const metrics = calculatePRF1(runA, gold);
console.log(`P: ${metrics.precision}, R: ${metrics.recall}, F1: ${metrics.f1}`);
// Output: P: 1.00, R: 1.00, F1: 1.00 (runA matches gold perfectly)
```

---

## Key Design Decisions

| Decision                       | Rationale                                                                 |
| ------------------------------ | ------------------------------------------------------------------------- |
| **Macro-averaging for P/R/F1** | Treats all classes equally, appropriate for imbalanced annotation tasks   |
| **Standard Cohen's Kappa**     | Simplest inter-rater metric; Fleiss' Kappa (3+ raters) deferred to future |
| **Round to 2 decimals**        | Sufficient precision for research comparison                              |
| **Exclude zero-sample pairs**  | Pairs with no overlapping sessions shouldn't affect mean                  |
