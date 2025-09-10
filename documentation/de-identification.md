---
title: "De-identification"
tags: ["de-identification"]
category: "Privacy & Security"
isPublished: false
---

# De-identification

## Overview

**De-identification** is the process of removing or masking personally identifiable information (PII) from your tutoring transcripts. This is a critical security and privacy feature that ensures sensitive data, such as names, addresses, or other identifying details, are not exposed during the analysis.

The de-identification process takes place automatically when data is imported into the NTO Pipeline, ensuring that all data handled by the LLM is anonymized.

## How to use

This is an automated process that is a fundamental part of the NTO Pipeline's security and privacy measures.

1.  **Import a File:** When you upload a new tutoring data **File**, the de-identification process begins automatically.
2.  **Review Data:** After the file is processed and converted into **Sessions**, the data will be de-identified before being sent to the LLM for a **Run**.
