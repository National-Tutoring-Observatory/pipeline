---
title: "LLM Costs"
tags: ["llm-costs", "billing"]
category: "Collaboration"
isPublished: true
---

# LLM Costs

## Overview

Sandpiper tracks all **LLM costs** at a granular level, logging every API call with its associated token usage, provider cost, and source operation. This gives teams full visibility into what drives their spending and helps optimize prompt and model selection for cost efficiency.

Every LLM operation records the **input tokens** (the data sent to the model), **output tokens** (the model's response), the **provider cost** (what the LLM provider charges), and the **source** (what triggered the call).

## Key Metrics

### Cost by Model

View a breakdown of spending across different LLM models. This helps you compare the cost-effectiveness of models like Claude, GPT-4, and others for your annotation tasks.

### Cost by Source

Understand which operations consume the most credits:

| Source                         | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| **annotation:per-session**     | Annotating whole sessions                               |
| **annotation:per-utterance**   | Annotating individual utterances                        |
| **verification:per-session**   | Verifying per-session annotations                       |
| **verification:per-utterance** | Verifying per-utterance annotations                     |
| **adjudication:per-session**   | Resolving per-session disagreements                     |
| **adjudication:per-utterance** | Resolving per-utterance disagreements                   |
| **file-conversion**            | Converting uploaded files to sessions                   |
| **codebook-prompt-generation** | Auto-generating prompts from codebooks                  |
| **prompt-alignment**           | Aligning prompts across versions                        |
| **attribute-mapping**          | Mapping annotation attributes                           |

### Cost Over Time

Track spending trends over time with daily, weekly, or monthly granularity. This is useful for budgeting and identifying usage spikes.

## How to use

1.  **Navigate to Billing:** Go to your **Team** page and click the "Billing" tab.
2.  **View Cost Breakdown:** Review cost summaries by model, by source, and over time.
3.  **Optimize:** Use the cost data to make informed decisions about which models to use and how to structure your annotation runs for cost efficiency.

## Related Concepts

- **[Billing and Credits](billing)** — The credit system that funds LLM operations
- **[Runs](runs)** — The primary consumer of LLM credits
- **[Teams](teams)** — Cost tracking is scoped to teams
- **[LLM Providers](llmProviders)** — The models and providers behind cost calculations
