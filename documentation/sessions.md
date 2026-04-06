---
title: "Sessions"
tags: ["sessions"]
category: "Data Management"
isPublished: true
---

# Sessions

## Overview

A **Session** is the primary unit of tutoring data that the LLM analyzes. A single imported **File** may contain one or multiple sessions, depending on its structure. Each session represents a distinct tutoring interaction and can be selected individually for a **Run**.

Sessions are the building blocks of your analysis, as they are the pieces of data that the **Prompt** is applied to. Each session contains a structured transcript of utterances with speaker roles and content. Sandpiper tracks the **input token count** for each session, which is used to estimate costs before running annotations.

Sessions can also be created from the **Million Tutor Moves (MTM) Dataset**, allowing you to get started with real tutoring transcripts without uploading your own data.

## How to use

### Creating Sessions from Files

Sessions are created automatically when you upload a **File**.

1.  **Import a File:** Upload a new tutoring data file to a **Project**.
2.  **Automatic Conversion:** Sandpiper converts each file into one or more sessions in the background. You can monitor the conversion status on the project page.
3.  **View Sessions:** Once conversion is complete, view the individual sessions listed within the project. Each session shows its name, utterance count, and input token count.

### Creating Sessions from the MTM Dataset

1.  **Use MTM Dataset:** From the project upload page, click "Use MTM Dataset" to import sessions from the **Million Tutor Moves** dataset.
2.  **Automatic Import:** Sandpiper imports the pre-processed tutoring transcripts into your project as sessions, ready for annotation.

### Selecting Sessions for Runs

1.  **Configure a Run:** When you set up a new **Run** or **Run Set**, select which sessions to include in the analysis.
2.  **Token Estimates:** Session input token counts are used to calculate cost and time estimates for your runs.

## External Guides

- **[Upload Instructions](https://docs.google.com/document/d/16dSQp_MopRPLGYYgjgaWsXaJId3oufjvvgDqEWQfiDU/edit)** — Guide for preparing and uploading data that becomes sessions

## Related Concepts

- **[Files](files)** — The raw data that is converted into sessions
- **[Runs](runs)** — The analysis process applied to sessions
- **[Transcripts](transcripts)** — The JSON format specification for session data
- **[Projects](projects)** — The workspace that contains sessions
- **[MTM Dataset](mtmDataset)** — Pre-built sessions from the Million Tutor Moves dataset
