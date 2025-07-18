import LLM from "~/core/llm/llm";
import type { AnnotationSchemaItem } from "../prompts.types";
import type { Route } from "./+types/promptVersionAlignment.route";

export async function action({
  request
}: Route.ActionArgs) {

  const { userPrompt, annotationSchema } = await request.json();

  let annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of annotationSchema as AnnotationSchemaItem[]) {
    if (!annotationSchemaItem.isSystem) {
      annotationFields[annotationSchemaItem.fieldKey] = annotationSchemaItem.value;
    }
  }
  const annotationSchemaArray = [annotationFields];

  const llm = new LLM({ quality: 'high', model: 'GEMINI' });

  llm.addSystemMessage(`You are an expert at looking over LLM prompts and are able to determine whether the prompt matches the annotation schema provided by the user. 
    If they match, pass back a boolean true value. 
    If they do not match, pass back a boolean false value and rewrite the whole prompt with the suggested improvement.
    Give your reasoning in the reasoning value.
    Your reasoning should be one sentence maximum.
    Only rewrite the prompt if isMatching is equal to false. 
    Do not return the prompt if isMatching is equal to false.
    Always return you result as the following JSON: {{output}}.
    `, {
    output: JSON.stringify({
      isMatching: false,
      prompt: '',
      reasoning: ''
    })
  });

  llm.addUserMessage(`Prompt:\n{{prompt}}\n\nAnnotation schema:\n{{annotationSchema}}`, {
    prompt: userPrompt,
    annotationSchema: JSON.stringify(annotationSchemaArray),
  })

  const response = await llm.createChat();

  return response;

}