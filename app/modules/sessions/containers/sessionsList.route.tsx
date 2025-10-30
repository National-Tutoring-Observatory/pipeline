import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isProjectOwner } from "~/modules/projects/helpers/projectOwnership";
import type { User } from "~/modules/users/users.types";
import type { Session } from "../sessions.types";
import type { Route } from "./+types/sessionsList.route";

type Sessions = {
  data: [Session],
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const project = url.searchParams.get('project');

  if (!project) {
    return redirect('/');
  }

  if (!(await isProjectOwner({ user, projectId: project }))) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const sessions = await documents.getDocuments({ collection: 'sessions', match: { project: project, hasConverted: true }, sort: {} }) as Sessions;
  return { sessions };
}
