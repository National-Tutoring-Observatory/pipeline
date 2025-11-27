import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { PromptVersion } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import { isPromptOwner } from "../helpers/promptOwnership";
import type { Route } from "./+types/promptVersionsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');

  if (!prompt) {
    return redirect('/');
  }

  if (!(await isPromptOwner({ user, promptId: prompt }))) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<PromptVersion>({ collection: 'promptVersions', match: { prompt: prompt }, sort: { version: -1 } });
  const promptVersions = { data: result.data };
  return { promptVersions };
}
