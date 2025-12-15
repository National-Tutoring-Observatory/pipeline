import LLM from "~/modules/llm/llm";
import type { AnnotationSchemaItem } from "../prompts.types";
import type { Route } from "./+types/promptVersionAlignment.route";
import type { User } from "~/modules/users/users.types";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import PromptAuthorization from "../authorization";
import { redirect } from "react-router";

export async function action({
  request
}: Route.ActionArgs) {

  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const { userPrompt, annotationSchema, team } = await request.json();

  if (!PromptAuthorization.canCreate(user, team)) {
    throw new Error('Access denied');
  }

  let annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of annotationSchema as AnnotationSchemaItem[]) {
    if (!annotationSchemaItem.isSystem) {
      annotationFields[annotationSchemaItem.fieldKey] = annotationSchemaItem.value;
    }
  }
  const annotationSchemaArray = [annotationFields];

  const llm = new LLM({ quality: 'high', model: 'GEMINI', user: team });

  llm.addSystemMessage(`You are an expert at looking over LLM prompts and are able to determine whether the prompt matches the annotation schema provided by the user.
    - The main focus for you is to make sure whatever is written in the prompt has an annotation field associated with it.
    - If they match, pass back a boolean true value.
    - If they do not match, pass back a boolean false value and rewrite the whole prompt with the suggested improvement.
    - Give your reasoning in the reasoning value.
    - Your reasoning should be one sentence maximum.
    - Only rewrite the prompt if isMatching is equal to false.
    - Do not return the prompt if isMatching is equal to false.
    - Always return you result as the following JSON: {{output}}.
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
