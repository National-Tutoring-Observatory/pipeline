---
title: "Per session"
tags: ["per-session"]
category: "Analysis"
isPublished: true
---

# Per session

## Overview

**Per session** is an **Annotation Type** that instructs the LLM to analyze your tutoring data as a complete whole. This approach is best for identifying overarching themes or summary-level information about a **Session**.

When you choose this type, the LLM will read the entire transcript of a session and produce a single **Annotation** that summarizes the content based on your **Prompt**'s instructions.

## How to use

You select "Per session" when you set up a **Run**.

1.  **Start a New Run:** Begin the run configuration process.
2.  **Select Annotation Type:** From the "Annotation Type" dropdown menu, choose "Per session."
3.  **Finalize Run:** Complete the rest of your run configuration by selecting your **Prompt** and **Sessions** before starting the analysis.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Includes per-session prompt examples (e.g., session quality, dominant teaching strategy)

## Related Concepts

- **[Annotation Type](annotationType)** — Overview of all annotation types
- **[Per Utterance](perUtterance)** — Alternative fine-grained annotation
- **[Prompts](prompts)** — Instructions that guide per-session analysis
- **[Schema](schema)** — Defines the fields for session-level annotations
- **[Runs](runs)** — Where per-session annotation is applied
