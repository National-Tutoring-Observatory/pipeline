import type { Route } from "./+types/runsList.route";
import type { Run } from "../runs.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Runs = {
  data: Run[],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get('project');
  const documents = getDocumentsAdapter();
  const runs = await documents.getDocuments({ collection: 'runs', match: { project: project }, sort: {} }) as Runs;
  return { runs };
}