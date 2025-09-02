import type { Route } from "./+types/promptVersionsList.route";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

type PromptVersions = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');
  const documents = getDocumentsAdapter();
  const promptVersions = await documents.getDocuments({ collection: 'promptVersions', match: { prompt: Number(prompt) }, sort: { version: -1 } }) as PromptVersions;
  return { promptVersions };
}