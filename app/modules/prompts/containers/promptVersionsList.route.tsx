import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/promptsList.route";

type PromptVersions = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt');
  const promptVersions = await getDocuments({ collection: 'promptVersions', match: { prompt: Number(prompt) }, sort: { version: -1 } }) as PromptVersions;
  return { promptVersions };
}