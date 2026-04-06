---
title: "De-identification"
tags: ["de-identification"]
category: "Privacy & Security"
isPublished: false
---

# De-identification

## Overview

**De-identification** is the process of removing or masking personally identifiable information (PII) from your tutoring transcripts. This is a critical security and privacy feature that ensures sensitive data, such as names, addresses, phone numbers, or other identifying details, are not exposed during the analysis.

The de-identification process takes place automatically when data is imported into Sandpiper, ensuring that all data handled by the LLM is anonymized. This is particularly important for researchers working with educational data that may fall under **FERPA** or **COPPA** compliance requirements.

All LLM API calls are routed through Cornell University's **Secure AI Gateway**, a university-managed proxy that ensures your data is never stored or used by the underlying model providers.

## How to use

This is an automated process that is a fundamental part of Sandpiper's security and privacy measures.

1.  **Import a File:** When you upload a new tutoring data **File**, the de-identification process begins automatically as part of the file conversion pipeline.
2.  **Automatic Processing:** Sandpiper scans the transcript for PII patterns and masks or removes them before the data is stored as **Sessions**.
3.  **Review Data:** After the file is processed and converted into sessions, the data will be de-identified before being sent to the LLM for a **Run**.

## Related Concepts

- **[Files](files)** — The raw data that undergoes de-identification
- **[Sessions](sessions)** — The de-identified data ready for analysis
- **[Privacy Policy](privacyPolicy)** — Full terms of use and data handling
- **[LLM Providers](llmProviders)** — How the AI Gateway ensures data privacy
