import type { Route } from "./+types/promptsList.route";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

type Prompts = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const annotationType = url.searchParams.get('annotationType');
  const documents = getDocumentsAdapter();
  const prompts = await documents.getDocuments({ collection: 'prompts', match: { annotationType }, sort: {} }) as Prompts;
  return { prompts };
}