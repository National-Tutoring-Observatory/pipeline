import type { Route } from "./+types/runsList.route";
import type { Run } from "../runs.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { redirect } from "react-router";
import validateProjectOwnership from "~/modules/projects/helpers/validateProjectOwnership";


type Runs = {
  data: Run[],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project');

  if (!projectId) {
    throw new Error("Project parameter is required.");
  }

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }

  await validateProjectOwnership({ user, projectId });

  const documents = getDocumentsAdapter();
  const runs = await documents.getDocuments({ collection: 'runs', match: { project: projectId }, sort: {} }) as Runs;
  return { runs };
}
