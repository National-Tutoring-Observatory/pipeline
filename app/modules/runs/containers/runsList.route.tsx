import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/runsList.route";
import type { Run } from "../runs.types";

type Runs = {
  data: Run[],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get('project');
  const runs = await getDocuments({ collection: 'runs', match: { project: Number(project) }, sort: {} }) as Runs;
  return { runs };
}