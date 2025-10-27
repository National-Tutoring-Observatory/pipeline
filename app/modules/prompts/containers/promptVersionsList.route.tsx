import type { Route } from "./+types/promptVersionsList.route";
import type { User } from "~/modules/users/users.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { redirect } from "react-router";

type PromptVersions = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');
  const documents = getDocumentsAdapter();
  const promptVersions = await documents.getDocuments({ collection: 'promptVersions', match: { prompt: prompt }, sort: { version: -1 } }) as PromptVersions;
  return { promptVersions };
}
