import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import type { Route } from "./+types/promptVersionsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const promptId = url.searchParams.get('prompt');

  if (!promptId) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const prompt = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: promptId } });

  if (!prompt.data) {
    return redirect('/');
  }

  if (!PromptAuthorization.canView(user, prompt.data)) {
    return redirect('/');
  }

  const result = await documents.getDocuments<PromptVersion>({ collection: 'promptVersions', match: { prompt: promptId }, sort: { version: -1 } });
  const promptVersions = { data: result.data };
  return { promptVersions };
}
