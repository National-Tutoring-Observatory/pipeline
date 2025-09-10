---
title: "Welcome to the NTO Pipeline"
tags: ["welcome", "overview"]
category: "Overview"
isPublished: true
---

# Welcome to the NTO Pipeline

## Overview

The NTO (National Tutoring Observatory) Pipeline is a powerful application designed to streamline the analysis of one-on-one tutoring data. It provides a comprehensive workflow for researchers and teams, starting with the secure **Normalization** and **De-identification** of data. The core functionality of the app lies in its ability to leverage large language models (**LLM**s) to automatically create detailed **Annotations** of tutoring transcripts.

**Users** can create, manage, and version their own custom **Prompts** to guide the LLM's analysis, allowing them to pinpoint specific instructional moves, such as giving praise or asking a probing question. The NTO Pipeline organizes this process into **Projects**, **Sessions**, and **Runs**, and provides a central **Dashboard** for monitoring progress and exporting the annotated data for further analysis in formats like CSV and JSON. This tool empowers users to efficiently transform raw tutoring data into structured, meaningful insights.

## How to use

The NTO Pipeline is designed for a streamlined workflow, from data ingestion to analysis.

1.  **Create a Project:** Start by creating a new **Project** to organize your work.
2.  **Import Data:** Upload your tutoring data **Files**. The app will automatically perform **Normalization** and **De-identification** and break the files into individual **Sessions**.
3.  **Create a Prompt:** Write a **Prompt** that instructs the LLM on what to look for in the tutoring data. Use the dedicated **Schema** section to define your desired output.
4.  **Initiate a Run:** Select the sessions and prompt you wish to analyze and start a new **Run**. Choose your preferred **Annotation Type** (e.g., "Per session" or "Per annotation").
5.  **Review and Export:** Monitor the progress of your **Run** on the **Dashboard**. Once complete, you can download the generated **Annotations** for further research and analysis.