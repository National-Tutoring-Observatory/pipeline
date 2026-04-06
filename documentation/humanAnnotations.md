---
title: "Human Annotations"
tags: ["human-annotations", "runs", "evaluation"]
category: "Analysis"
isPublished: false
---

# Human Annotations

## Overview

**Human Annotations** allow you to upload manually coded labels into Sandpiper, creating **Human Runs** that can be directly compared against LLM runs in an **Evaluation**. This is essential for measuring the accuracy of LLM annotations against a human gold standard.

When you upload a CSV of human annotations, Sandpiper validates the data, matches it to the sessions in your **Run Set**, and creates one human run per annotator. These human runs then appear alongside LLM runs in the evaluation, enabling calculation of **Precision**, **Recall**, **F1**, and **Cohen's Kappa** between human and LLM annotators.

## How to use

### Downloading the Annotation Template

1.  **Open a Run Set:** Navigate to the **Run Set** where you want to add human labels.
2.  **Download Template:** Click **"Download Annotation Template"** to get a CSV file pre-populated with all session transcripts and annotation fields from the run set.
3.  **Review the Template:** The template includes columns for session IDs, utterance IDs (for per-utterance annotation), and empty annotation columns for each field in the schema.

### Annotating the CSV

1.  **Fill in Labels:** Open the CSV in a spreadsheet editor and fill in the annotation columns with your human labels.
2.  **Multiple Annotators:** If you have multiple human annotators, include each annotator's labels in separate columns. Sandpiper will detect and create a separate human run for each annotator.
3.  **Use Consistent Codes:** Ensure the values in annotation columns match the codes defined in your **Prompt Schema** (e.g., `PRAISE`, `NOT_PRAISE`).

### Uploading the CSV

1.  **Navigate to Human Annotations:** From the **Run Set** detail page, click on the human annotations upload option.
2.  **Upload the CSV:** Select your completed CSV file. Sandpiper will analyze the file and display a validation summary:
    - **Matched sessions** — Sessions in the CSV that match the run set
    - **Unmatched sessions** — Session IDs in the CSV that were not found
    - **Missing sessions** — Sessions in the run set not covered by the CSV
    - **Detected annotators** — The annotators found in the column headers
    - **Annotation fields** — The fields that will be imported
3.  **Confirm Upload:** Review the analysis results and click "Upload" to create the human runs.
4.  **Processing:** Sandpiper processes the annotations in the background and adds the human runs to the run set.

### Using Human Runs in Evaluations

Once human runs are added to a run set:

1.  **Create an Evaluation:** From the **Evaluation** tab, create a new evaluation that includes both human and LLM runs.
2.  **Set Human Run as Base:** Select a human run as the **Base Run** to calculate accuracy metrics (Precision, Recall, F1) for all other runs.
3.  **Compare Results:** The evaluation will show agreement scores between all run pairs, with human labels serving as ground truth.

## Related Concepts

- **[Run Sets](run-sets)** — Where human annotations are uploaded and compared
- **[Runs](runs)** — Human runs appear alongside LLM runs
- **[Evaluation Equations](evaluation-equations)** — The metrics used to compare runs
- **[Schema](schema)** — Defines the annotation fields for the template
- **[Adjudication](adjudication)** — Resolve disagreements after human/LLM comparison
