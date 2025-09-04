# Run

## Overview

A **Run** is the process of applying a **Prompt** to your tutoring data to generate **Annotations**. This is the action that triggers the LLM to begin its analysis. When you initiate a run, you define all the parameters for the analysis, including which **Sessions** to analyze, the **Annotation Type** to use, and which **Prompt** and LLM model to apply.

The NTO Pipeline's core purpose is to facilitate and manage these runs, providing a structured way to get valuable insights from your data.

## How to use

You initiate a run from within a **Project**.

1.  **Start a New Run:** Navigate to a **Project** and click "New Run."
2.  **Configure the Run:** On the run configuration screen, you will make the following selections:
    * **Sessions:** Choose the specific sessions you want to analyze.
    * **Prompt:** Select the prompt you want to use.
    * **Annotation Type:** Choose whether to run the analysis line-by-line or on the whole session.
    * **LLM Model:** Select the LLM model you wish to use.
3.  **Initiate Analysis:** Once all options are set, click "Start Run." You can then monitor the run's progress from the **Dashboard** or the project's details page.