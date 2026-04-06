---
title: "Files"
tags: ["files"]
category: "Data Management"
isPublished: true
---

# Files

## Overview

**Files** are the raw, imported tutoring data you upload to Sandpiper. These are typically transcripts or other forms of text-based data from your research. Upon upload, the application automatically processes each file, converting it into one or more **Sessions** for individual analysis.

Files serve as the source material for all analysis within a **Project**. Sandpiper supports uploading transcript files in JSON format that conform to the **Transcript Format Specification**. Uploaded files are stored securely using the configured storage adapter (local filesystem or AWS S3) and encrypted at rest.

## How to use

The primary way to interact with files is through the import process.

1.  **Import a New File:** Navigate to a **Project** and locate the "Upload Files" section. You can drag and drop files or click to browse.
2.  **Select and Upload:** Select the tutoring data file from your computer and upload it. Sandpiper will begin processing the file in the background.
3.  **Check Status:** You can monitor the status of the import process on the project page. Once complete, the file will be broken down into individual **Sessions** that are ready for a **Run**.
4.  **Review Sessions:** After conversion, review the created sessions to verify the data was parsed correctly, including utterance counts and speaker roles.

## External Guides

- **[Upload Instructions](https://docs.google.com/document/d/16dSQp_MopRPLGYYgjgaWsXaJId3oufjvvgDqEWQfiDU/edit)** — Step-by-step guide for preparing and uploading your tutoring data files

## Related Concepts

- **[Sessions](sessions)** — The individual tutoring interactions created from files
- **[Transcripts](transcripts)** — The JSON format specification for file data
- **[Projects](projects)** — The workspace that contains files
- **[De-identification](de-identification)** — PII removal during import
