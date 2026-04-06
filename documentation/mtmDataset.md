---
title: "MTM Dataset"
tags: ["mtm", "dataset", "sessions"]
category: "Data Management"
isPublished: true
---

# MTM Dataset

## Overview

The **Million Tutor Moves (MTM) Dataset** is the National Tutoring Observatory's open-access collection of over one million tutoring interactions from seven tutoring platforms. Sandpiper integrates the MTM dataset directly into the application, allowing you to get started with real tutoring transcripts without uploading your own data.

MTM sessions are pre-processed and ready for annotation. When you add the MTM dataset to a **Project**, Sandpiper imports the sessions with pre-calculated input token counts, utterance counts, and speaker roles.

## How to use

### Adding MTM Sessions to a Project

1.  **Navigate to Upload:** Open a **Project** and go to the file upload page.
2.  **Click "Use MTM Dataset":** Instead of uploading your own files, click the MTM dataset option.
3.  **Automatic Import:** Sandpiper imports the MTM sessions into your project in the background. You can monitor the import progress on the project page.
4.  **Start Annotating:** Once the import is complete, the MTM sessions appear in your project alongside any other sessions and are ready to be selected for **Runs**.

### What is Included

Each MTM session includes:

- A structured transcript of utterances with speaker roles and content
- Pre-calculated input token counts for cost estimation
- Utterance counts and lead speaker role identification

## Related Concepts

- **[Sessions](sessions)** — MTM sessions are standard sessions in Sandpiper
- **[Files](files)** — MTM sessions are imported similarly to uploaded files
- **[Projects](projects)** — The workspace where MTM sessions are added
- **[Runs](runs)** — Annotate MTM sessions just like any other data
- **[De-identification](de-identification)** — How PII is handled in MTM data
