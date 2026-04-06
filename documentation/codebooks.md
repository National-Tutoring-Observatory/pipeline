---
title: "Codebooks"
tags: ["codebooks", "prompts"]
category: "Configuration"
isPublished: false
---

# Codebooks

## Overview

A **Codebook** is a structured classification scheme that defines the categories, codes, and definitions used to annotate tutoring transcripts. Codebooks bring rigor and consistency to annotation by providing a shared vocabulary and set of examples that guide both human annotators and LLMs.

Each codebook contains **Categories** (broad groupings), **Codes** (specific labels within a category), and **Examples** (illustrative instances of each code). Codebooks support **Versioning**, allowing you to refine your classification scheme over time while preserving previous versions for reproducibility.

A key feature of codebooks is the ability to **auto-generate Prompts** directly from a codebook's definitions and examples. This bridges the gap between your coding scheme and the LLM instructions, ensuring alignment between what you intend to measure and what the LLM looks for.

## How to use

### Creating a Codebook

1.  **Navigate to Codebooks:** From your **Team** workspace, click the "Codebooks" section.
2.  **Create New Codebook:** Click "New Codebook" and enter a name and description.
3.  **Open the Editor:** The codebook editor opens with an empty structure ready for your categories and codes.

### Defining Categories and Codes

In the codebook editor:

1.  **Add a Category:** Create a broad grouping (e.g., "Instructional Moves," "Student Responses").
2.  **Add Codes:** Within each category, define specific codes (e.g., "Praise," "Scaffolding," "Probing Question").
3.  **Write Definitions:** For each code, write a clear definition explaining what it means and when it applies.
4.  **Add Examples:** Provide examples for each code using the example types:

| Example Type   | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| **Hit**        | A clear, unambiguous example of the code                             |
| **Near Hit**   | A borderline example that still qualifies                            |
| **Near Miss**  | A borderline example that does not qualify                           |
| **Miss**       | A clear example of what the code is not                              |

5.  **Save the Version:** Click "Save" to store your codebook version.

### Versioning

1.  **Create a New Version:** Click "New Version" to create a copy of the current version for editing. The original version is preserved.
2.  **Mark as Production:** Designate a version as "Production" to make it the active default for prompt generation.

### Generating a Prompt from a Codebook

1.  **Open the Codebook:** Navigate to the codebook version you want to use.
2.  **Click "Create Prompt from Codebook":** Sandpiper sends your codebook's categories, codes, definitions, and examples to an LLM, which drafts an annotation prompt.
3.  **Review the Prompt:** The generated prompt opens in the **Prompt** editor. Review and refine the instructions before saving.
4.  **Link is Preserved:** The prompt retains a reference to the source codebook and version for traceability.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Covers how codebook-generated prompts work and best practices for annotation schema

## Related Concepts

- **[Prompts](prompts)** — The instructions generated from or inspired by codebooks
- **[Prompt Versions](promptVersions)** — Track revisions to codebook-generated prompts
- **[Schema](schema)** — The structured output fields, often derived from codebook codes
- **[Annotation Type](annotationType)** — How the LLM applies the codebook-derived prompt
