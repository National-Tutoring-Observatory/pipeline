---
title: "Run Sets"
tags: ["run-sets", "runs"]
category: "Analysis"
isPublished: true
---

# Run Sets

## Overview

A **Run Set** is a container that groups multiple **Runs** together for comparison and analysis. Run sets enable researchers to organize related experiments—such as comparing different prompt versions or LLM models on the same data—and evaluate their relative performance.

## Key Concepts

| Concept             | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Runs**            | A run set contains 2 or more runs that were applied to the same sessions            |
| **Sessions**        | The shared tutoring data that each run analyzed                                     |
| **Annotation Type** | Run sets require runs with the same annotation type (e.g., per utterance or per session) |
| **Human Runs**      | Upload human-annotated CSVs to include human labels in the comparison               |

## How to Use

### Creating a Run Set

Run sets can be created from two entry points:

**From the Run Sets Page:**

1. Navigate to a **Project** and click the "Run Sets" tab
2. Click **"New Run Set"**
3. Enter a name for your run set
4. Select the **Sessions** you want to analyze
5. Click **"Create Run Set"**

**Batch Run Creation:**

You can define multiple prompt/model combinations and create all runs at once:

1. In the run set creation screen, click **"Add Run Definition"**
2. For each run, select a **Prompt** and **LLM Model**
3. Review the **Cost Estimate** — Sandpiper calculates the estimated cost and time for all runs combined
4. Click **"Create & Start Runs"** to launch all runs simultaneously

### Adding Runs to a Run Set

You can expand an existing run set by adding more runs:

1. Open a **Run Set** detail page
2. Click **"Add Runs"**
3. Select additional runs to include (must use the same sessions and annotation type)
4. Click **"Add"**

### Merging Run Sets

Combine two run sets that share sessions:

1. Open a **Run Set** detail page
2. Click **"Merge"** (or **"⋮" → Merge**)
3. Select another run set to merge with
4. The runs from both run sets will be combined

### Viewing Run Set Details

The Run Set detail page has three tabs:

| Tab            | Contents                                                        |
| -------------- | --------------------------------------------------------------- |
| **Runs**       | Table of all runs in the run set with prompt, model, and status |
| **Sessions**   | List of sessions shared across runs                             |
| **Evaluation** | Comparison metrics (Kappa, P/R/F1) and top performers           |

### Exporting Run Set Data

Export all annotation data from a run set:

1. Open a **Run Set** detail page
2. Click **"Export"** in the header
3. The export includes annotations from all runs for comparison

## Best Practices

1. **Same sessions, different configs** — Compare runs that analyzed the same sessions
2. **Consistent annotation types** — Runs must use the same annotation type
3. **At least 2 runs** — Run sets need 2+ runs for meaningful comparison
4. **Add human labels** — Upload ground truth for the most informative metrics
5. **Descriptive names** — Name run sets by experiment (e.g., "Creative v3 Model Comparison")

## Related Concepts

- **[Runs](runs)** — The experimental units being compared
- **[Sessions](sessions)** — The data that runs analyze
- **[Projects](projects)** — The workspace containing run sets
- **[Prompts](prompts)** — The prompts used in runs
- **[Evaluations](evaluations)** — Compare and measure run agreement
- **[Human Annotations](humanAnnotations)** — Uploading human labels
- **[Annotation Type](annotationType)** — Runs must share the same annotation type
