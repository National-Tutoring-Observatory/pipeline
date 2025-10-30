import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import type { Session } from "~/modules/sessions/sessions.types";
import type { User } from "~/modules/users/users.types";
import ProjectSessions from "../components/projectSessions";
import { isProjectOwner } from "../helpers/projectOwnership";
import type { Route } from "./+types/projectSessions.route";

type Sessions = {
  data: [Session],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  if (!(await isProjectOwner({ user, projectId: params.id }))) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const sessions = await documents.getDocuments({ collection: 'sessions', match: { project: params.id }, sort: {} }) as Sessions;
  return { sessions };
}

export default function ProjectSessionsRoute() {
  const { sessions } = useLoaderData();

  const onSessionClicked = (session: Session) => {
    addDialog(
      <ViewSessionContainer
        session={session}
      />
    );
  }

  return (
    <ProjectSessions
      sessions={sessions.data}
      onSessionClicked={onSessionClicked}
    />
  )
}
