---
title: "Collections"
tags: ["collections", "runs", "evaluation"]
category: "Analysis"
isPublished: true
---

# Collections

## Overview

A **Collection** is a container that groups multiple **Runs** together for comparison and analysis. Collections enable researchers to organize related experiments—such as comparing different prompt versions or LLM models on the same data—and evaluate their relative performance.

Collections are the foundation of the **Evaluation** feature, allowing you to:
- Compare annotation agreement across multiple runs using **Cohen's Kappa**
- Identify top-performing prompt/model combinations
- Calculate **Precision, Recall, and F1** scores when human labels are available
- Export comparison results for external analysis or sharing

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Runs** | A collection contains 2 or more runs that were applied to the same sessions |
| **Sessions** | The shared tutoring data that each run analyzed |
| **Annotation Type** | Collections require runs with the same annotation type (e.g., per-line or per-session) |
| **Evaluation** | When runs are grouped, you can compare their annotations for agreement |

## How to Use

### Creating a Collection

Collections can be created from two entry points:

**From the Collections Page:**
1. Navigate to a **Project** and click the "Collections" tab
2. Click **"New Collection"**
3. Enter a name for your collection
4. Select the **Sessions** you want to analyze
5. Select 2 or more **Runs** that annotated those sessions
6. Click **"Create Collection"**

**From the Runs Page (Quick Selection):**
1. In the Runs tab, check the boxes next to 2+ runs you want to compare
2. Click **"Create Collection"** from the selection action bar
3. The collection wizard opens with your selected runs pre-filled

### Adding Runs to a Collection

You can expand an existing collection by adding more runs:

1. Open a **Collection** detail page
2. Click **"Add Runs"**
3. Select additional runs to include (must use the same sessions and annotation type)
4. Click **"Add"**

### Merging Collections

Combine two collections that share sessions:

1. Open a **Collection** detail page
2. Click **"Merge"** (or **"⋮" → Merge**)
3. Select another collection to merge with
4. The runs from both collections will be combined

### Viewing Collection Details

The Collection detail page has three tabs:

| Tab | Contents |
|-----|----------|
| **Runs** | Table of all runs in the collection with prompt, model, and status |
| **Sessions** | List of sessions shared across runs |
| **Evaluation** | Comparison metrics (Kappa, P/R/F1) and top performers |

### Exporting Collection Data

Export all annotation data from a collection:

1. Open a **Collection** detail page
2. Click **"Export"** in the header
3. Choose format: **CSV** or **JSONL**
4. The export includes annotations from all runs for comparison

## Evaluation Tab

The Evaluation tab provides at-a-glance comparison of all runs in the collection:

### Summary Statistics
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

### Adding Human Labels

To enable accuracy metrics (Precision, Recall, F1):

1. Include a `human_label` column in your session data CSV
2. Upload sessions with human-verified annotations
3. The Evaluation tab will automatically detect and use these labels

**Example CSV format:**
```csv
session_id,utterance_id,annotation,human_label
sess_001,utt_001,CREATIVE,CREATIVE
sess_001,utt_002,NOT_CREATIVE,CREATIVE
```

## Best Practices

1. **Same sessions, different configs** — Compare runs that analyzed the same sessions
2. **Consistent annotation types** — Runs must use the same annotation type
3. **At least 2 runs** — Collections need 2+ runs for meaningful comparison
4. **Add human labels** — Upload ground truth for the most informative metrics
5. **Descriptive names** — Name collections by experiment (e.g., "Creative v3 Model Comparison")

## Related Concepts

- **[Runs](runs)** — The experimental units being compared
- **[Sessions](sessions)** — The data that runs analyze
- **[Projects](projects)** — The workspace containing collections
- **[Prompts](prompts)** — The prompts used in runs
