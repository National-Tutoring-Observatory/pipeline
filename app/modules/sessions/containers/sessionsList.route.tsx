import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { Project } from "~/modules/projects/projects.types";
import type { User } from "~/modules/users/users.types";
import type { Session } from "../sessions.types";
import type { Route } from "./+types/sessionsList.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('project');

  if (!projectId) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const project = await documents.getDocument<Project>({
    collection: 'projects',
    match: { _id: projectId },
  });
  if (!project.data) {
    return redirect('/');
  }

  const teamId = (project.data.team as any)._id || project.data.team;
  if (!ProjectAuthorization.canView(user, teamId)) {
    return redirect('/');
  }

  const result = await documents.getDocuments<Session>({ collection: 'sessions', match: { project: projectId, hasConverted: true }, sort: {} });
  return { sessions: result };
}
