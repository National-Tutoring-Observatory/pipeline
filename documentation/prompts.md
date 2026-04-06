---
title: "Prompts"
tags: ["prompts"]
category: "Analysis"
isPublished: true
---

# Prompts

## Overview

A **Prompt** is the set of instructions you give to the LLM. It is the central element that tells the LLM exactly what to look for and how to create **Annotations** from your tutoring data. A well-written prompt is crucial for getting accurate and useful results.

You can create prompts to find a wide variety of patterns in your data, from identifying instances of specific teacher praise to recognizing moments of student confusion. **Prompt Versions** allow you to refine and improve your instructions over time.

Each prompt includes an **Annotation Schema** that defines the structured fields the LLM should populate when annotating. The schema specifies field names, expected values, and data types, ensuring consistent and machine-readable output across all runs.

## How to use

You will create and manage prompts within a **Team**.

### Creating a Prompt Manually

1.  **Create a New Prompt:** Navigate to the "Prompts" section and click "Create New Prompt."
2.  **Write Your Instructions:** Write clear and specific instructions for the LLM. You can provide examples to help the model understand your goal.
3.  **Define the Schema:** Use the **Schema** editor to specify the annotation fields the LLM should return (e.g., `praise_detected`, `question_type`). Define the allowed values or codes for each field.
4.  **Select Annotation Type:** Choose whether this prompt is designed for **Per Utterance** or **Per Session** annotation.
5.  **Save and Version:** Save your prompt. Any time you make an edit, a new **Prompt Version** is automatically created, preserving your revision history.

### Creating a Prompt from a Codebook

If you have defined a **Codebook**, you can auto-generate a prompt from it:

1.  **Open a Codebook:** Navigate to the **Codebooks** section and open the codebook you want to use.
2.  **Generate Prompt:** Click "Create Prompt from Codebook." Sandpiper will use an LLM to draft a prompt based on your codebook's categories, codes, definitions, and examples.
3.  **Review and Edit:** The generated prompt will appear in the prompt editor. Review and refine the instructions before saving.

### Using a Prompt in a Run

1.  **Select for a Run:** When you configure a new **Run**, select the desired prompt and **Prompt Version** from the dropdown.
2.  **Mark as Production:** Designate a specific version as the "production" version to make it the default selection for new runs.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Detailed guide covering prompt structure, schema setup, per-utterance and per-session prompt examples, and best practices for annotation prompts

## Related Concepts

- **[Prompt Versions](promptVersions)** — Track revisions to your prompts
- **[Codebooks](codebooks)** — Define classification schemes that can generate prompts
- **[Schema](schema)** — Define the structure of annotation output
- **[Annotation Type](annotationType)** — Choose per-utterance or per-session analysis
- **[Runs](runs)** — Apply prompts to data
