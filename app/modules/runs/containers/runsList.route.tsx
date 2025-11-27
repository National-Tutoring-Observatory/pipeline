import map from 'lodash/map';
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Run } from "../runs.types";
import type { Route } from "./+types/runsList.route";


export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project');

  if (!projectId) {
    throw new Error("Project parameter is required.");
  }

  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  // First verify the project exists and user has access
  const project = await documents.getDocument({
    collection: 'projects',
    match: { _id: projectId, team: { $in: teamIds } }
  }) as { data: any };

  if (!project.data) {
    return redirect('/');
  }

  const result = await documents.getDocuments({ collection: 'runs', match: { project: projectId }, sort: {} });
  const runs = { data: result.data as Run[] };
  return { runs };
}
