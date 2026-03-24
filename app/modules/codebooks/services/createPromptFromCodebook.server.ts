import LLM from "~/modules/llm/llm";
import { getDefaultModelCode } from "~/modules/llm/modelRegistry";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { CodebookService } from "../codebook";
import { CodebookVersionService } from "../codebookVersion";
import {
  buildAnnotationSchemaFromCategories,
  buildCodebookSummary,
} from "../helpers/buildCodebookSummary";

export default async function createPromptFromCodebook({
  codebookId,
  codebookVersionId,
  annotationType,
  userId,
  teamId,
}: {
  codebookId: string;
  codebookVersionId: string;
  annotationType: string;
  userId: string;
  teamId: string;
}) {
  const codebook = await CodebookService.findById(codebookId);
  if (!codebook) {
    throw new Error("Codebook not found");
  }

  const codebookVersion =
    await CodebookVersionService.findById(codebookVersionId);
  if (!codebookVersion) {
    throw new Error("Codebook version not found");
  }

  const summary = buildCodebookSummary({
    codebookName: codebook.name,
    codebookDescription: codebook.description,
    categories: codebookVersion.categories,
  });

  const annotationSchema = buildAnnotationSchemaFromCategories(
    codebookVersion.categories,
  );

  const llm = new LLM({
    model: getDefaultModelCode(),
    user: teamId,
    source: "codebook-prompt-generation",
    sourceId: codebookId,
  });

  llm.addSystemMessage(
    `You are an expert at writing LLM annotation prompts for analysing tutoring transcripts.
    - You will be given a codebook summary containing categories, codes, definitions, and examples.
    - Your task is to write a clear, detailed prompt that an LLM can use to annotate transcripts according to the codebook.
    - The prompt should instruct the LLM to classify each annotation field using the codes defined in the codebook.
    - Include the code definitions and examples from the codebook so the LLM understands each code.
    - Do not include any JSON schema or output format instructions — those are handled separately.
    - Always return your result as the following JSON: {{output}}.`,
    {
      output: JSON.stringify({ prompt: "" }),
    },
  );

  llm.addUserMessage(`Codebook summary:\n{{summary}}`, {
    summary,
  });

  const response = await llm.createChat();
  const userPrompt = response.prompt;

  const prompt = await PromptService.create({
    name: codebook.name,
    annotationType,
    team: teamId,
    productionVersion: 1,
    createdBy: userId,
  });

  await PromptVersionService.create({
    name: "initial",
    prompt: prompt._id,
    version: 1,
    userPrompt,
    annotationSchema,
    codebook: codebookId,
    codebookVersion: codebookVersionId,
  });

  return prompt;
}
