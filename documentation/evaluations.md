---
title: "Evaluations"
tags: ["evaluation", "run-sets", "metrics"]
category: "Analysis"
isPublished: true
---

# Evaluations

## Overview

**Evaluations** allow you to compare annotation agreement across multiple **Runs** within a **Run Set**. When two or more runs have analyzed the same **Sessions**, an evaluation calculates pairwise agreement metrics, identifies top-performing prompt/model combinations, and provides tools to resolve disagreements through **Adjudication**.

Evaluations use standard inter-rater reliability metrics including **Cohen's Kappa**, **Precision**, **Recall**, and **F1** scores. When **Human Annotations** are included as ground truth, these metrics measure how closely each LLM run matches the human gold standard.

## How to use

### Creating an Evaluation

1.  **Open a Run Set:** Navigate to a **Run Set** that contains two or more **Runs**.
2.  **Click the Evaluation Tab:** From the run set detail page, click the "Evaluation" tab.
3.  **View Results:** Sandpiper automatically calculates pairwise agreement metrics for all runs in the set.

### Summary Statistics

The evaluation overview displays:

- **Mean Kappa** — Average agreement across all run pairs
- **Best Performer** — Top-ranked prompt/model combination
- **Human Label** — Whether ground truth labels are available
- **Comparisons** — Number of pairwise evaluations

### Top Performers

Ranked cards showing the best 3 runs by:

- **Agreement (κ)** with human labels (when available), or
- **Mean agreement** with other runs (when no human labels)

When human labels are present, cards also show **Precision**, **Recall**, and **F1** scores.

### Pairwise Agreement Matrix

A heatmap showing Cohen's Kappa between every pair of runs:

- **Green cells** (κ ≥ 0.61) — Substantial agreement
- **Amber cells** (κ 0.41–0.60) — Moderate agreement
- **Red cells** (κ < 0.41) — Fair/Poor agreement

### Starting an Adjudication

After reviewing evaluation results, you can resolve disagreements:

1.  **Click "Start Adjudication"** from the Evaluation tab.
2.  **Select Source Runs:** Choose the runs whose disagreements you want to resolve.
3.  **Adjudication Run:** Sandpiper creates an **Adjudication Run** that uses an LLM to vote on conflicting annotations.
4.  **Automatic Re-evaluation:** Once the adjudication run completes, the evaluation is automatically re-run to include the adjudicated results.

## Related Concepts

- **[Run Sets](run-sets)** — The container where evaluations are performed
- **[Runs](runs)** — The annotation runs being compared
- **[Evaluation Equations](evaluation-equations)** — The formulas behind Kappa, Precision, Recall, and F1
- **[Human Annotations](humanAnnotations)** — Gold standard labels for accuracy metrics
- **[Adjudication](adjudication)** — Resolve disagreements identified by evaluation
