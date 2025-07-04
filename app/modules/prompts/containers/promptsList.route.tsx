import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/promptsList.route";

type Prompts = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const annotationType = url.searchParams.get('annotationType');
  const prompts = await getDocuments({ collection: 'prompts', match: { annotationType }, sort: {} }) as Prompts;
  return { prompts };
}