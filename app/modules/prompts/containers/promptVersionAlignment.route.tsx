import { data, redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import LLM from "~/modules/llm/llm";
import { getDefaultModelCode } from "~/modules/llm/modelRegistry";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import type { AnnotationSchemaItem } from "../prompts.types";
import type { Route } from "./+types/promptVersionAlignment.route";

export async function action({ request }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const { userPrompt, annotationSchema, team, promptId } = await request.json();

  if (!PromptAuthorization.canCreate(user, team)) {
    throw new Error("Access denied");
  }

  const annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of annotationSchema as AnnotationSchemaItem[]) {
    if (!annotationSchemaItem.isSystem) {
      const field: Record<string, any> = {
        value: annotationSchemaItem.value,
      };
      if (annotationSchemaItem.codes && annotationSchemaItem.codes.length > 0) {
        field.codes = annotationSchemaItem.codes;
      }
      annotationFields[annotationSchemaItem.fieldKey] = field;
    }
  }
  const annotationSchemaArray = [annotationFields];

  const llm = new LLM({
    model: getDefaultModelCode(),
    user: team,
    source: "prompt-alignment",
    sourceId: promptId,
  });

  llm.addSystemMessage(
    `You are an expert at looking over LLM prompts and are able to determine whether the prompt matches the annotation schema provided by the user.
    - The main focus for you is to make sure whatever is written in the prompt has an annotation field associated with it.
    - If a field has codes, check that the prompt mentions those codes and that they match the codes in the schema.
    - If they match, pass back a boolean true value.
    - If they do not match, pass back a boolean false value and rewrite the whole prompt with the suggested improvement.
    - Give your reasoning in the reasoning value.
    - Your reasoning should be one sentence maximum.
    - Only rewrite the prompt if isMatching is equal to false.
    - Do not return the prompt if isMatching is equal to true.
    - Always return you result as the following JSON: {{output}}.
    `,
    {
      output: JSON.stringify({
        isMatching: false,
        prompt: "",
        reasoning: "",
      }),
    },
  );

  llm.addUserMessage(
    `Prompt:\n{{prompt}}\n\nAnnotation schema:\n{{annotationSchema}}`,
    {
      prompt: userPrompt,
      annotationSchema: JSON.stringify(annotationSchemaArray),
    },
  );

  try {
    const response = await llm.createChat();
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check alignment";
    return data({ errors: { general: message } }, { status: 500 });
  }
}
