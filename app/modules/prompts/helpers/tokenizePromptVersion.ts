import { encode } from "gpt-tokenizer";
import buildAnnotationSchema from "~/modules/llm/helpers/buildAnnotationSchema";
import type { AnnotationSchemaItem } from "../prompts.types";

export default function tokenizePromptVersion(
  userPrompt: string,
  annotationSchema: AnnotationSchemaItem[],
): number {
  const annotationFields: Record<string, any> = {};
  for (const item of annotationSchema) {
    annotationFields[item.fieldKey] = item.value;
  }
  const llmAnnotationSchema = { annotations: [annotationFields] };
  const responseSchema = buildAnnotationSchema(
    llmAnnotationSchema,
    annotationSchema,
  );

  return encode(
    `${userPrompt}\n\n${JSON.stringify(llmAnnotationSchema)}\n\n${JSON.stringify(responseSchema)}`,
  ).length;
}
