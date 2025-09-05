### Annotation Type

The **Annotation Type** is a critical setting for every **Run**. It determines how the LLM analyzes your tutoring data, specifically whether it should look at the data in small chunks or as a whole. Your choice of annotation type will directly impact the granularity of the **Annotations** you receive.

The two main types are **Per annotation** (line-by-line analysis) and **Per session** (whole session analysis). In the future, a "per segmentation" option will be added for even more granular control.

#### How to use

You select the annotation type when you set up a **Run**.

1.  **Start a New Run:** Navigate to a **Project** and click to start a new **Run**.
2.  **Choose Annotation Type:** On the run configuration screen, you will be prompted to select the **Annotation Type** from a dropdown menu.
3.  **Select Your Type:** Choose "Per annotation" if you need detailed, line-specific labels (e.g., "praise" on line 5). Choose "Per session" if you need a single, overarching summary of the entire session (e.g., "Overall, the tutor used a lot of praise").
4.  **Complete Run Setup:** Continue configuring your run by selecting your **Prompt**, LLM model, and **Sessions**.
