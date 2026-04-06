---
title: "Per Utterance"
tags: ["per-utterance", "per-annotation"]
category: "Analysis"
isPublished: true
---

# Per Utterance

## Overview

**Per Utterance** (also referred to as "Per Annotation") is an **Annotation Type** that instructs the LLM to analyze your tutoring data on an utterance-by-utterance basis. This is a fine-grained approach that is best for identifying specific actions or events that occur at a precise moment in a **Session**.

When you choose this type, the LLM will read each individual utterance in a transcript and create a separate **Annotation** for it based on your **Prompt** instructions. This is ideal for coding specific instructional moves, such as identifying praise, scaffolding, or question types at the turn level.

## How to use

You select "Per Utterance" when you set up a **Run**.

1.  **Start a New Run:** Begin the run configuration process.
2.  **Select Annotation Type:** From the "Annotation Type" dropdown menu, choose "Per Utterance."
3.  **Define Your Schema:** Ensure your **Prompt** includes an **Annotation Schema** with the fields you want labeled for each utterance (e.g., `move_type`, `is_praise`).
4.  **Finalize Run:** Complete the rest of your run configuration by selecting your **Prompt** and **Sessions** before starting the analysis.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Includes per-utterance prompt examples and best practices

## Related Concepts

- **[Annotation Type](annotationType)** — Overview of all annotation types
- **[Per Session](perSession)** — Alternative whole-session annotation
- **[Prompts](prompts)** — Instructions that guide per-utterance analysis
- **[Schema](schema)** — Defines the fields for each annotation
