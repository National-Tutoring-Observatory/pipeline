---
title: "Sandpiper Overview"
tags: ["welcome", "overview"]
category: "Overview"
isPublished: true
---

# Sandpiper Overview

## Overview

Sandpiper is the National Tutoring Observatory's (NTO) application designed to streamline the analysis of one-on-one tutoring data. The core functionality of the app lies in its ability to leverage large language models (**LLM**s) to automatically create detailed **Annotations** of tutoring transcripts.

**Users** can create, manage, and version their own custom **Prompts** to guide the LLM's analysis, or define structured **Codebooks** that auto-generate prompts. Sandpiper organizes this process into **Projects**, **Sessions**, and **Runs**, and provides tools for comparing annotation quality across different models and prompts through **Run Sets** and **Evaluations**.

The platform supports uploading **Human Annotations** alongside LLM runs to measure accuracy, and offers **Adjudication** to resolve disagreements between annotators. All LLM operations are routed through Cornell University's **Secure AI Gateway**, and costs are managed through a team-based **credit system**.

## How to use

Sandpiper is designed for a streamlined workflow, from data ingestion to analysis.

1.  **Create a Project:** Start by creating a new **Project** to organize your work.
2.  **Import Data:** Upload your tutoring data **Files**, or use the **MTM Dataset** to get started with real transcripts. The app will automatically process files and convert them into individual **Sessions**.
3.  **Create a Prompt:** Write a **Prompt** that instructs the LLM on what to look for in the tutoring data. Optionally, define a **Codebook** first and generate a prompt from it. Use the **Schema** section to define your desired output fields.
4.  **Initiate a Run:** Select the sessions and prompt you wish to analyze and start a new **Run**. Choose your preferred **Annotation Type** (Per Utterance or Per Session) and LLM model.
5.  **Compare and Evaluate:** Group runs into **Run Sets** to compare annotation quality. Upload **Human Annotations** for ground truth comparison. Use **Evaluations** to calculate Cohen's Kappa, Precision, Recall, and F1 scores.
6.  **Adjudicate and Export:** When runs disagree, start an **Adjudication** to produce consensus annotations. Download your annotated data for further research and analysis.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Detailed guide for writing annotation prompts, schema setup, and per-utterance/per-session examples
- **[Upload Instructions](https://docs.google.com/document/d/16dSQp_MopRPLGYYgjgaWsXaJId3oufjvvgDqEWQfiDU/edit)** — Step-by-step instructions for preparing and uploading your tutoring data
