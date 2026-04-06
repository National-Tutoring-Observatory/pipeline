---
title: "Adjudication"
tags: ["adjudication", "evaluation", "runs"]
category: "Analysis"
isPublished: false
---

# Adjudication

## Overview

**Adjudication** is the process of resolving annotation disagreements between multiple **Runs**. When different LLM models or prompt configurations produce conflicting annotations for the same data, adjudication uses an LLM to review the disagreements and produce a consensus annotation.

An **Adjudication Run** is a special type of run that takes two or more source runs as input, identifies utterances or sessions where the source runs disagree, and uses an LLM to vote on the correct annotation. The result is a new run containing the adjudicated consensus annotations.

After the adjudication run completes, Sandpiper automatically re-runs the **Evaluation** to include the adjudicated results, showing how the consensus compares to the original runs.

## How to use

### Starting an Adjudication

Adjudication is initiated from the **Evaluation** tab of a **Run Set**.

1.  **Run an Evaluation:** First, create an evaluation in your run set to compare your runs and identify disagreements.
2.  **Review Results:** Examine the pairwise agreement matrix to see where runs disagree.
3.  **Start Adjudication:** Click **"Start Adjudication"** from the evaluation results page.
4.  **Select Source Runs:** Choose the runs whose disagreements you want to resolve. Typically, you select the top-performing runs or the runs you are most interested in reconciling.

### How Adjudication Works

1.  **Disagreement Detection:** Sandpiper identifies all utterances or sessions where the selected source runs produced different annotations.
2.  **LLM Voting:** For each disagreement, the adjudication LLM reviews the source annotations and the original transcript data, then votes on which annotation is correct.
3.  **Consensus Output:** The adjudication produces a new run with consensus annotations — one label per utterance or session, reflecting the resolved disagreement.
4.  **Automatic Re-evaluation:** Once adjudication completes, the evaluation is re-run with the adjudication run included, so you can see how the consensus compares to the original runs.

### Interpreting Adjudication Results

In the updated evaluation:

- The adjudication run appears alongside the original runs in the pairwise agreement matrix.
- Compare the adjudication run's agreement with each source run to understand which runs were closest to the consensus.
- If human labels are available, compare the adjudication run against human ground truth to measure its accuracy.

## Related Concepts

- **[Run Sets](run-sets)** — Where adjudication is initiated
- **[Runs](runs)** — Adjudication runs are a special run type
- **[Evaluation Equations](evaluation-equations)** — Metrics used to measure agreement
- **[Human Annotations](humanAnnotations)** — Compare adjudicated results against human labels
