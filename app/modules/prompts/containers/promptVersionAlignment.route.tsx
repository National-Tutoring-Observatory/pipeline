import { data, redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import checkPromptAndAnnotationSchemaAlignment from "../services/checkPromptAndAnnotationSchemaAlignment.server";
import type { Route } from "./+types/promptVersionAlignment.route";

export async function action({ request }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const { intent, userPrompt, annotationSchema, team, promptId } =
    await request.json();

  if (!PromptAuthorization.canCreate(user, team)) {
    throw new Error("Access denied");
  }

  switch (intent) {
    case "ALIGNMENT_CHECK": {
      try {
        const response = await checkPromptAndAnnotationSchemaAlignment({
          userPrompt,
          annotationSchema,
          team,
          promptId,
        });
        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to check alignment";
        return data({ errors: { general: message } }, { status: 500 });
      }
    }
  }

  return data({ errors: { general: "Invalid intent" } }, { status: 400 });
}
