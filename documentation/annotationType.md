---
title: "Annotation Type"
tags: ["annotation-type"]
category: "Analysis"
isPublished: true
---

# Annotation Type

## Overview

The **Annotation Type** is a critical setting for every **Run**. It determines how the LLM analyzes your tutoring data, specifically whether it should look at the data utterance-by-utterance or as a whole session. Your choice of annotation type will directly impact the granularity of the **Annotations** you receive.

Sandpiper supports two annotation types:

| Type                | Code              | Description                                                  |
| ------------------- | ----------------- | ------------------------------------------------------------ |
| **Per Utterance**   | `PER_UTTERANCE`   | Line-by-line analysis — the LLM annotates each utterance individually |
| **Per Session**     | `PER_SESSION`     | Whole-session analysis — the LLM produces a single annotation for the entire session |

## How to use

You select the annotation type when you set up a **Run** or create a **Prompt**.

1.  **Start a New Run:** Navigate to a **Project** and click to start a new **Run**.
2.  **Choose Annotation Type:** On the run configuration screen, you will be prompted to select the **Annotation Type**.
3.  **Select Your Type:** Choose "Per Utterance" if you need detailed, utterance-specific labels (e.g., "praise" on utterance 5). Choose "Per Session" if you need a single, overarching summary of the entire session (e.g., "Overall, the tutor used a lot of praise").
4.  **Complete Run Setup:** Continue configuring your run by selecting your **Prompt**, LLM model, and **Sessions**.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Covers how to write prompts for both per-utterance and per-session annotation types

## Related Concepts

- **[Per Utterance](perUtterance)** — Detailed line-by-line annotation
- **[Per Session](perSession)** — Whole-session annotation
- **[Runs](runs)** — Where annotation types are applied
- **[Prompts](prompts)** — Instructions tailored to each annotation type
- **[Schema](schema)** — Defines the fields for each annotation type
