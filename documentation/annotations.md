---
title: "Annotations"
tags: ["annotations"]
category: "Analysis"
isPublished: true
---

# Annotations

## Overview

**Annotations** are the core output of the NTO Pipeline's analysis. They are pieces of data created by an LLM based on a specific **Prompt**. An annotation is essentially a tag or a label applied to a segment of a tutoring transcript. It often includes a tag (e.g., "gives praise"), a description explaining why the tag was applied, and other information as defined by a **Schema**.

Annotations are created during a **Run** and provide the detailed, structured data you need for your research. They are attached to specific lines or full transcripts of a **Session**.

## How to use

Annotations are generated automatically during a **Run**. You primarily interact with them after the analysis is complete.

1.  **View Annotations:** After a run has finished, you can view the generated annotations by navigating to the specific **Run**'s details page. The annotations will be displayed alongside the original transcript.
2.  **Download Annotations:** From the **Dashboard** or the **Run** details page, you can download all the annotations in a structured format, such as CSV or JSON, for further analysis.
3.  **Refine Prompts:** If the annotations are not meeting your expectations, you can go back and edit your **Prompt**, create a new **Prompt version**, and run the analysis again.