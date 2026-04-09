---
title: "Billing and Credits"
tags: ["billing", "credits", "teams"]
category: "Collaboration"
isPublished: false
---

# Billing and Credits

## Overview

Sandpiper uses a **credit-based billing system** to manage the cost of LLM annotations. Every time a **Run** is executed, the LLM API calls consume credits based on the number of tokens processed and the model used. Credits are managed at the **Team** level, meaning all members of a team share a common credit balance.

Each team is assigned a **Billing Plan** that determines the markup rate applied to raw provider costs. Teams can purchase additional credits via **Stripe** or receive credits from administrators.

## Key Concepts

| Concept            | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| **Credits**        | The currency used to pay for LLM operations in Sandpiper           |
| **Billing Plan**   | Determines pricing markup for a team                               |
| **Billing Period** | A time window that tracks costs and credit usage                   |
| **Provider Cost**  | The raw cost charged by the LLM provider (e.g., OpenAI, Anthropic) |
| **Billed Amount**  | The provider cost with the team's billing plan markup applied      |

## How to use

### Viewing Your Balance

1.  **Navigate to Team Billing:** Go to your **Team** page and click the "Billing" tab.
2.  **View Balance:** Your current credit balance is displayed at the top of the page, along with recent usage.

### Purchasing Credits

1.  **Add Credits:** From the billing page, click **"Add Credits"**.
2.  **Stripe Checkout:** You will be redirected to Stripe to complete the purchase.
3.  **Credits Applied:** Once the payment is processed, credits are immediately added to your team's balance.

### Understanding Costs

Costs are tracked across several categories:

| Cost Source                    | Description                                   |
| ------------------------------ | --------------------------------------------- |
| **Annotation (per session)**   | LLM calls for per-session annotation runs     |
| **Annotation (per utterance)** | LLM calls for per-utterance annotation runs   |
| **Verification**               | Self-verification of annotation quality       |
| **Adjudication**               | LLM calls to resolve annotation disagreements |
| **File Conversion**            | LLM calls during transcript parsing           |
| **Codebook Prompt Generation** | LLM calls to generate prompts from codebooks  |

### Cost Estimation

Before starting a run, Sandpiper provides a cost estimate based on:

- The number of **Sessions** to annotate
- The **input token count** of each session
- The pricing tiers of the selected **LLM Model**

If your team has insufficient credits, you will see a warning. You can acknowledge the warning and proceed, or purchase additional credits first.

## Related Concepts

- **[Teams](teams)** — Credits are managed at the team level
- **[Runs](runs)** — Where credits are consumed
- **[LLM Costs](llmCosts)** — Detailed cost tracking and analytics
- **[LLM Providers](llmProviders)** — The models and providers that determine pricing
