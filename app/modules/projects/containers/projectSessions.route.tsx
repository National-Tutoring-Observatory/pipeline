import { redirect, useLoaderData, useRouteLoaderData, useSubmit } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import type { Session } from "~/modules/sessions/sessions.types";
import convertFilesToSessions from "~/modules/uploads/convertFilesToSessions";
import type { User } from "~/modules/users/users.types";
import ProjectSessions from "../components/projectSessions";
import { isProjectOwner } from "../helpers/projectOwnership";
import type { Project as ProjectType } from "../projects.types";
import createSessionsFromFiles from "../services/createSessionsFromFiles.server";
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

export async function action({
  request,
  params,
  context
}: Route.ActionArgs) {

  const { intent } = await request.json();

  switch (intent) {
    case 'RE_RUN': {
      const hasWorkers = await hasFeatureFlag('HAS_WORKERS', { request });

      if (hasWorkers) {
        createSessionsFromFiles({ projectId: params.id, shouldCreateSessionModels: false }, { request });
      } else {
        convertFilesToSessions({ entityId: params.id });
      }

      const documents = getDocumentsAdapter();

      return await documents.updateDocument({ collection: 'projects', match: { _id: params.id }, update: { isConvertingFiles: true } }) as { data: ProjectType };

    }
    default:
      return {};
  }
}

export default function ProjectSessionsRoute() {
  const { sessions } = useLoaderData();
  const { project } = useRouteLoaderData("project");
  const submit = useSubmit();

  const onSessionClicked = (session: Session) => {
    addDialog(
      <ViewSessionContainer
        session={session}
      />
    );
  }

  const onReRunClicked = () => {
    submit(JSON.stringify({
      intent: 'RE_RUN',
      payload: {}
    }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <ProjectSessions
      project={project.data}
      sessions={sessions.data}
      onSessionClicked={onSessionClicked}
      onReRunClicked={onReRunClicked}
    />
  )
}
