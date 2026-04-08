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

  const annotationSchemaArray = [];

  let annotationSchemaCodes = ``;

  for (const annotationSchemaItem of annotationSchema as AnnotationSchemaItem[]) {
    if (!annotationSchemaItem.isSystem) {
      annotationSchemaArray.push({
        [annotationSchemaItem.fieldKey]: annotationSchemaItem.value,
      });

      if (annotationSchemaItem.codes && annotationSchemaItem.codes.length > 0) {
        annotationSchemaCodes += `${annotationSchemaItem.fieldKey}: ${annotationSchemaItem.codes.join(" | ")}\n`;
      }
    }
  }

  const schema = {
    type: "object",
    properties: {
      isMatching: { type: "boolean" },
      prompt: { type: "string" },
      reasoning: { type: "string" },
      annotationSchema: {
        type: "object",
        additionalProperties: true,
      },
    },
    required: ["isMatching", "prompt", "reasoning", "annotationSchema"],
  };

  const llm = new LLM({
    model: getDefaultModelCode(),
    user: team,
    source: "prompt-alignment",
    sourceId: promptId,
    schema,
  });

  const codesRule = annotationSchemaCodes
    ? `\n- If an "Annotation schema codes" section is provided, check that the prompt instructs the LLM to use values from those lists for the corresponding fields.`
    : "";

  llm.addSystemMessage(
    `- The main focus for you is to make sure whatever is written in the prompt has an annotation field associated with it.
    ${codesRule}
    - If they match, pass back a boolean true value.
    - If they do not match, pass back a boolean false value and rewrite the whole prompt with the suggested improvement.
    - Do not include the annotationSchema in the prompt text. Make sure this is returned in the annotationSchema array.
    - Give your reasoning in the reasoning value.
    - Your reasoning should be one sentence maximum.
    - Only rewrite the prompt if isMatching is equal to false.
    - Do not return the prompt if isMatching is equal to true.
    - If the prompt is re-written include the annotationSchema array to have the correct annotation fields.
    - Always return you result as the following JSON: {{output}}.
    `,
    {
      output: JSON.stringify({
        isMatching: false,
        prompt: "",
        annotationSchema: { fieldName: "value" },
        reasoning: "",
      }),
    },
  );

  const userMessageParts = [
    `Prompt:\n{{prompt}}`,
    `Annotation schema:\n{{annotationSchema}}`,
  ];

  const userMessageVariables: Record<string, string> = {
    prompt: userPrompt,
    annotationSchema: JSON.stringify(annotationSchemaArray),
  };

  if (annotationSchemaCodes) {
    userMessageParts.push(
      `Annotation schema codes:\n{{annotationSchemaCodes}}`,
    );
    userMessageVariables.annotationSchemaCodes = annotationSchemaCodes;
  }

  llm.addUserMessage(userMessageParts.join("\n\n"), userMessageVariables);

  try {
    const response = await llm.createChat();
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check alignment";
    return data({ errors: { general: message } }, { status: 500 });
  }
}
