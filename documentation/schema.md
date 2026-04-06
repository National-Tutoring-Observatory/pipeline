---
title: "Schema"
tags: ["schema"]
category: "Configuration"
isPublished: true
---

# Schema

## Overview

The **Schema** defines the structure of your **Annotations**. It is a template that outlines the specific fields and information that the LLM should include in each annotation it creates.

In Sandpiper, the schema is defined in two ways:

1.  **In the Prompt:** You can provide instructions to the LLM within your **Prompt** to tell it how to format the output.
2.  **In a dedicated section:** The application also provides a dedicated section for you to explicitly declare the expected schema output. Here, you can define a variable name for the output and set its data type (e.g., string, boolean, integer, etc.).

By defining a schema, you ensure that the output of your analysis is consistent, structured, and easy to work with once exported.

## How to use

You configure the schema as part of your **Prompt** creation process.

1.  **Create or Edit a Prompt:** Navigate to the prompt creation or editing page.
2.  **Define the Schema:** In the dedicated schema section, add a new variable for each piece of information you want the LLM to output. Give each variable a name (e.g., `praise_detected`) and select its data type (e.g., `boolean`).
3.  **Instruct the LLM:** In the main **Prompt** instructions, tell the LLM how to fill in the schema you've defined (e.g., "Set `praise_detected` to true if praise is found.").
4.  **Save and Validate:** When you save the prompt, the app will automatically run a script to check that the schema you defined in the prompt's instructions matches the user-defined schema section. This ensures your analysis runs smoothly and produces the expected output.
5.  **Verify Output:** After a **Run**, you can review the generated **Annotations** to ensure they follow the structured schema you provided.

## External Guides

- **[Prompt Writing Guide](https://docs.google.com/document/d/1Rf2p3ltWSCk3VTeuTtXTpVu7NkrAi8yNDloYLId-KU8/edit)** — Covers schema setup in detail, including field types and how to align schema with prompt instructions

## Related Concepts

- **[Prompts](prompts)** — Where the schema is defined and used
- **[Codebooks](codebooks)** — Classification schemes that inform schema fields
- **[Annotations](annotations)** — The structured output that follows the schema
- **[Runs](runs)** — Where the schema is applied to produce annotations
